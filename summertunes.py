from multiprocessing import Process
from subprocess import Popen

def cmd(args, kwargs=None):
    kwargs = kwargs or {}
    Popen(args, **kwargs).communicate()

if __name__ == '__main__':
    try:
        procs = [
            Process(target=cmd, args=(['python', 'mpv2websocket/mpv2websocket.py'],)),
            Process(target=cmd, args=(['python', 'httbeets/httbeets.py'],)),
            Process(target=cmd, args=(['npm', 'start'], {"cwd": "client"})),
        ]
        for p in procs:
            p.start()
        p.join()
    except KeyboardInterrupt:
        raise SystemExit
    finally:
        for p in procs:
            if not p.is_alive():
                continue
            p.terminate()