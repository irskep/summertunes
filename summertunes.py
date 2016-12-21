#!/usr/bin/env python
import os
import signal
from multiprocessing import Process, Queue
from subprocess import Popen

def cmd(q, args, kwargs=None):
    kwargs = kwargs or {}
    p = Popen(args, **kwargs)
    q.put(p.pid)
    p.communicate()

if __name__ == '__main__':
    try:
        q = Queue()
        procs = [
            Process(target=cmd, args=(q, ['python', 'mpv2websocket/mpv2websocket.py'])),
            Process(target=cmd, args=(q, ['python', 'httbeets/httbeets.py'])),
            Process(target=cmd, args=(q, ['npm', 'start'], {"cwd": "client"})),
        ]
        for p in procs:
            p.start()
        p.join()
    finally:
        while not q.empty():
            pid = q.get()
            print("Kill", pid)
            os.kill(pid, signal.SIGTERM)
            # kill it twice; mpv2websocket is gross
            os.kill(pid, signal.SIGTERM)
        for p in procs:
            if not p.is_alive():
                continue
            p.terminate()
