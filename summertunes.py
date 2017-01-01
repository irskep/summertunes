#!/usr/bin/env python
import json
import logging
import os
import signal
from argparse import ArgumentParser, ArgumentError, Action as ArgparseAction
from configparser import ConfigParser
from multiprocessing import Process, Queue
from pprint import pprint
from subprocess import Popen, PIPE

#from mpv2websocket.mpv2websocket import main as mpv_main
#from httbeets.httbeets import main as beets_main

log = logging.getLogger("summertunes")
logging.basicConfig()


DEFAULT_CONFIG = """
[summertunes]
port = 3000

[player.html5]
enabled = true

[player.mpv]
enabled = true
port = 3001
socket_path = /tmp/mpv_socket

[library.httbeets]
enabled = true
port = 3002
"""


def flatten_comma_separated_strings(strings):
    for s in strings:
        for s2 in s.split(','):
            yield s2


def add_to_set_action(choices):
    class AddToSetAction(ArgparseAction):
        def __call__(self, parser, namespace, value, option_string=None):
            s = getattr(namespace, self.dest, set())
            for value in flatten_comma_separated_strings([value]):
                if value not in choices:
                    args = {
                        'value': value,
                        'choices': ', '.join(map(repr, self.choices))}
                    msg = 'invalid choice: %(value)r (choose from %(choices)s)'
                    raise ArgumentError(self, msg % args)
                s.add(value)
            setattr(namespace, self.dest, s)
    return AddToSetAction


def remove_from_set_action(choices):
    class RemoveFromSetAction(ArgparseAction):
        def __call__(self, parser, namespace, value, option_string=None):
            s = getattr(namespace, self.dest, set())
            for value in flatten_comma_separated_strings([value]):
                if value not in choices:
                    args = {
                        'value': value,
                        'choices': ', '.join(map(repr, self.choices))}
                    msg = 'invalid choice: %(value)r (choose from %(choices)s)'
                    raise ArgumentError(self, msg % args)
                try:
                    s.remove(value)
                except KeyError:
                    pass
            setattr(namespace, self.dest, s)
    return RemoveFromSetAction


def cmd(q, args, kwargs=None):
    kwargs = kwargs or {}
    p = Popen(args, **kwargs)
    q.put(p.pid)
    try:
        p.communicate()
    except SystemExit:
        p.kill()
    except KeyboardInterrupt:
        p.kill()

def is_program_in_path(name):
    p = Popen(['which', name], stdout=PIPE)
    stdout = p.communicate()[0]
    return bool(stdout)


def run_some_processes(procs, pid_queue):
    try:
        last_p = None
        for p in procs:
            p.start()
            last_p = p

        if last_p:
            last_p.join()
    except KeyboardInterrupt:
        pass
    finally:
        while not pid_queue.empty():
            pid = pid_queue.get()
            log.info("Kill %d", pid)
            try:
                os.kill(pid, signal.SIGTERM)
                os.kill(pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        for p2 in procs:
            while p2.is_alive():
                p2.terminate()

def create_parser():
    config = ConfigParser()
    config.read_string(DEFAULT_CONFIG)
    config.read('summertunes.conf')

    default_player_services = set()
    default_library_services = set()
    if config.getboolean('player.mpv', 'enabled', fallback=False):
        default_player_services.add('mpv')
    if config.getboolean('player.html5', 'enabled', fallback=False):
        default_player_services.add('html5')
    if config.getboolean('library.httbeets', 'enabled', fallback=False):
        default_library_services.add('httbeets')

    parser = ArgumentParser(
        description="Run the Summertunes web frontend and whatever backends you want")
    parser.add_argument(
        '--web-interface-port', type=int, default=config.getint('summertunes', 'port', fallback=3000),
        help="Serve the web interface from this port")
    parser.add_argument(
        '--dev', default=False, action='store_true',
        help="Run debug node server with livereload")
    parser.add_argument(
        '--debug-args', default=False, action='store_true',
        help="Show parsed arg values and exit")

    parser.add_argument(
        "--player-services", action=add_to_set_action(default_player_services),
        dest="player_services", type=str, default=default_player_services,
        help="Players to expose to the web interface (default none). Example: 'mpv,html5'")

    parser.add_argument(
        "--disable-player-services", action=remove_from_set_action(default_player_services),
        dest="player_services", type=str,
        help="Players to expose to the web interface (default none). Example: 'mpv,html5'")

    parser.add_argument(
        "--library-services", action=add_to_set_action(default_library_services),
        dest="library_services", type=str, default=default_library_services)

    parser.add_argument(
        "--disable-library-services", action=remove_from_set_action(default_library_services),
        dest="library_services", type=str)

    g_mpv = parser.add_argument_group("mpv arguments")
    g_mpv.add_argument('--mpv-websocket-port', type=int, default=config.getint('player.mpv', 'port', fallback=3001))
    g_mpv.add_argument('--mpv-socket-path', type=str, default='/tmp/mpv_socket')

    g_beets = parser.add_argument_group("httbeets arguments")
    g_beets.add_argument('--httbeets-port', type=int, default=config.getint('library.httbeets', 'port', fallback=3002))

    return parser

def main():
    args = create_parser().parse_args()

    q = Queue()
    procs = []

    if args.dev:
        procs.append(Process(target=cmd, args=(q, ['npm', 'start'], {"cwd": "client"})))
    else:
        procs.append(Process(
            target=cmd, args=(
                q,
                # temporary:
                ['python', '-m', 'http.server', str(args.web_interface_port)],
                {"cwd": "client/build"})))

    if 'mpv' in args.player_services:
        if is_program_in_path('mpv'):
            procs.append(Process(target=cmd, args=(
                q, [
                    'python', 'mpv2websocket/mpv2websocket.py',
                    '--mpv-websocket-port', str(args.mpv_websocket_port),
                    '--mpv-socket-path', str(args.mpv_socket_path),
                ])))
        else:
            log.error("mpv not in path; skipping mpv player service")
    if 'httbeets' in args.library_services:
        procs.append(Process(target=cmd, args=(
            q, ['python', 'httbeets/httbeets.py', '--httbeets-port', str(args.httbeets_port)])))

    config_json_string = json.dumps({
        'HTTBEETS_PORT': args.httbeets_port,
        'MPV_PORT': args.mpv_websocket_port,
        'library_services': list(args.library_services),
        'player_services': list(args.player_services),
    })
    with open('client/build/server_config.js', 'w') as f:
        f.write(config_json_string)
    with open('client/public/server_config.js', 'w') as f:
        f.write(config_json_string)

    if not args.library_services:
        log.warning("No library services enabled. How will you pick anything?")
    if not args.player_services:
        log.warning("No player services enabled. How will you play anything?")

    if args.debug_args:
        pprint(vars(args))
    else:
        run_some_processes(procs, q)


if __name__ == '__main__':
    main()
