#!/usr/bin/env python
import json
import logging
import os
import signal
import sys
from multiprocessing import Process, Queue
from subprocess import Popen

log = logging.getLogger(__name__)


def _run_mpv_wrapper(pid_queue, mpv_args):
    log.debug(' '.join(mpv_args))
    proc = Popen(mpv_args)
    pid_queue.put(proc.pid)
    try:
        proc.communicate()
    except SystemExit:
        proc.kill()
        proc.kill()
    except KeyboardInterrupt:
        proc.kill()
        proc.kill()


def wait_for_processes(pid_queue, procs):
    try:
        last_proc = None
        for proc in procs:
            proc.start()
            last_proc = proc

        if last_proc:
            last_proc.join()
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


def run_mpv(websocket_port, socket_path):
    pid_queue = Queue()

    mpv_cmd = [
        sys.executable, '-m', 'summertunes.mpv2websocket',
        '--mpv-websocket-port', str(websocket_port),
        '--mpv-socket-path', str(socket_path),
    ]
    wait_for_processes(pid_queue, [
        Process(target=_run_mpv_wrapper, args=(pid_queue, mpv_cmd))
    ])
