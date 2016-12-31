#!/usr/bin/env python
import json
import logging
import os
import signal
from argparse import ArgumentParser
from multiprocessing import Process, Queue
from subprocess import Popen

from mpv2websocket.mpv2websocket import main as mpv_main
from httbeets.httbeets import main as beets_main

log = logging.getLogger("summertunes")
logging.basicConfig()

class CloseException(Exception):
    pass

def cmd(q, args, kwargs=None):
    kwargs = kwargs or {}
    p = Popen(args, **kwargs)
    q.put(p.pid)
    p.communicate()

def run_some_processes(procs, pid_queue):
    try:
        last_p = None
        for p in procs:
            p.start()
            last_p = p

        if last_p:
            last_p.join()
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

def main():
    parser = ArgumentParser(
        description="Run the Summertunes web frontend and whatever backends you want")
    parser.add_argument(
        '--web-interface-port', type=int, default=3000,
        help="Serve the web interface from this port")
    parser.add_argument(
        '--dev', default=False, action='store_true',
        help="Run debug node server with livereload")
    parser.add_argument(
        "--player-services",
        dest="player_services", type=str, action="append", default=[],
        help="Players to expose to the web interface (default none). Example: 'mpv,html5'")
    parser.add_argument(
        "--library-service", choices=["httbeets"], default=[],
        dest="library_services", type=str, action="append")

    g_mpv = parser.add_argument_group("mpv arguments")
    g_mpv.add_argument('--mpv-websocket-port', type=int, default=3001)
    g_mpv.add_argument('--mpv-socket-path', type=str, default='/tmp/mpv_socket')

    g_beets = parser.add_argument_group("httbeets arguments")
    g_beets.add_argument('--httbeets-port', type=int, default=3002)

    args = parser.parse_args()

    player_services = set()
    for arg in args.player_services:
        if ',' in arg:
            for sub_arg in arg.split(','):
                player_services.add(sub_arg)
        else:
            player_services.add(arg)

    q = Queue()
    procs = []

    if args.dev:
        procs.append(Process(target=cmd, args=(q, ['npm', 'start'], {"cwd": "client"})))
    else:
        procs.append(Process(
            target=cmd, args=(
                q,
                # temporary:
                ['python2', '-m', 'SimpleHTTPServer', str(args.web_interface_port)],
                {"cwd": "client/build"})))

    if 'mpv' in player_services:
        procs.append(Process(target=cmd, args=(
            q, [
                'python', 'mpv2websocket/mpv2websocket.py',
                '--mpv-websocket-port', str(args.mpv_websocket_port),
                '--mpv-socket-path', str(args.mpv_socket_path),
            ])))
    if 'httbeets' in args.library_services:
        procs.append(Process(target=cmd, args=(
            q, ['python', 'httbeets/httbeets.py', '--httbeets-port', str(args.httbeets_port)])))

    config_json_string = json.dumps({
        'HTTBEETS_PORT': args.httbeets_port,
        'MPV_PORT': args.mpv_websocket_port,
    })
    with open('client/build/server_config.js', 'w') as f:
        f.write(config_json_string)
    with open('client/public/server_config.js', 'w') as f:
        f.write(config_json_string)

    run_some_processes(procs, q)


if __name__ == '__main__':
    main()
