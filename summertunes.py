#!/usr/bin/env python
import json
import logging
import os
import signal
import socket
from argparse import ArgumentParser, ArgumentError, Action as ArgparseAction
from configparser import ConfigParser
from multiprocessing import Process, Queue
from pprint import pprint
from subprocess import Popen, PIPE

log = logging.getLogger("summertunes")
logging.basicConfig()

local_ip_string = socket.gethostbyname(socket.gethostname())


DEFAULT_CONFIG = """
[summertunes]
port = 3000

[player.html5]
enabled = true

[player.mpv]
enabled = true
port = 3001
socket_path = /tmp/mpv_socket

[beets.web]
port = 8337
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
        p.kill()
    except KeyboardInterrupt:
        p.kill()
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
    if config.getboolean('player.mpv', 'enabled', fallback=False):
        default_player_services.add('mpv')
    if config.getboolean('player.html5', 'enabled', fallback=False):
        default_player_services.add('html5')

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
        '--print-default-config', default=False, action='store_true',
        help="Print default config and exit")
    parser.add_argument(
        '--run-mpv', default=False, action='store_true',
        help="Instead of running summertunes, run mpv to match the current config")

    parser.add_argument(
        "--player-services", action=add_to_set_action(default_player_services),
        dest="player_services", type=str, default=default_player_services,
        help="Players to expose to the web interface (default %(default)s). Example: mpv,html5")

    parser.add_argument(
        "--disable-player-services", action=remove_from_set_action(default_player_services),
        dest="player_services", type=str,
        help="Remove a previously added player service")

    g_mpv = parser.add_argument_group("mpv arguments")
    g_mpv.add_argument(
        '--mpv-websocket-port', type=int,
        default=config.getint('player.mpv', 'port', fallback=3001))
    g_mpv.add_argument('--mpv-socket-path', type=str, default='/tmp/mpv_socket')

    g_beets = parser.add_argument_group("beets web arguments")
    g_beets.add_argument(
        '--beets-web-port', type=int, default=config.getint('beets.web', 'port', fallback=8337),
        help="'beet web' is serving on this port")

    return parser

def main():
    args = create_parser().parse_args()

    q = Queue()
    procs = []

    mpv_cmd = [
        'python', 'mpv2websocket/mpv2websocket.py',
        '--mpv-websocket-port', str(args.mpv_websocket_port),
        '--mpv-socket-path', str(args.mpv_socket_path),
    ]
    if args.run_mpv:
        print(" ".join(mpv_cmd))
        Popen(mpv_cmd).wait()
        return

    if args.dev:
        procs.append(Process(target=cmd, args=(q, ['npm', 'start'], {"cwd": "client"})))
    else:
        procs.append(Process(
            target=cmd, args=(
                q,
                # temporary:
                ['python', '-m', 'http.server', str(args.web_interface_port)],
                {"cwd": "client/build"})))

    config_json_string = json.dumps({
        'MPV_PORT': args.mpv_websocket_port,
        'BEETSWEB_PORT': args.beets_web_port,
        'player_services': list(args.player_services),
    })

    try:
        with open('client/build/server_config.js', 'w') as f:
            f.write(config_json_string)
    except FileNotFoundError:
        pass
    with open('client/public/server_config.js', 'w') as f:
        f.write(config_json_string)

    if not args.player_services:
        log.warning("No player services enabled. How will you play anything?")

    if args.debug_args:
        pprint(vars(args))
    elif args.print_default_config:
        print(DEFAULT_CONFIG.strip())
    else:
        print("Summertunes should now be accessible at http://{}:{}".format(
            local_ip_string, args.web_interface_port))
        run_some_processes(procs, q)


if __name__ == '__main__':
    main()
