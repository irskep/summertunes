import json
import os
import logging
import time
from argparse import ArgumentParser
from subprocess import Popen, PIPE

import eventlet
from eventlet.green import socket
from flask import Flask
from flask_socketio import SocketIO

log = logging.getLogger("mpv")
logging.basicConfig(level=logging.INFO)
logging.getLogger("socketio").setLevel(logging.ERROR)
logging.getLogger("engineio").setLevel(logging.ERROR)

try:
    import coloredlogs
    coloredlogs.install(
        fmt="%(asctime)s %(name)s %(levelname)s: %(message)s"
    )
except ImportError:
    pass

app = Flask(__name__)
socketio = SocketIO(app)

COMMAND_WHITELIST = {
    "get_property",
    "observe_property",
    "set_property",

    "seek",
    "playlist-clear",
    "playlist-remove",
    "loadfile",
    "playlist-next",
    "playlist-prev",
}

def _kill_socket(path):
    try:
        os.unlink(path)
    except OSError:
        if os.path.exists(path):
            raise

def _run_mpv(socket_path):
    _kill_socket(socket_path)

    mpv_process = Popen(
        [
            'mpv',
            '--quiet',
            '--audio-display=no',
            '--idle',
            '--gapless-audio',
            '--input-ipc-server', socket_path
        ],
        # block keyboard input
        stdin=PIPE)
    mpv_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) #pylint: disable=E1101

    return (mpv_process, mpv_socket)

OBSERVED_PROPERTIES = set()

@socketio.on('message')
def handle_json(body):
    json_string = json.dumps(body)
    body_bytes = (json_string + '\n').encode('UTF-8')
    log.info("> %s", json_string)

    if 'command' in body and body["command"][0] == "observe_property":
        if body["command"][2] in OBSERVED_PROPERTIES:
            log.info("Skipping already observed property %s", body["command"][2])
            return
        else:
            OBSERVED_PROPERTIES.add(body["command"][2])

    if 'command' in body and body["command"][0] not in COMMAND_WHITELIST:
        log.warning("Skipping non-whitelisted command %s", body["command"][0])
        return

    app.config['mpv_socket'].sendall(body_bytes)


def _listen_to_mpv(mpv_socket):
    # may or may not accurately handle partially delivered data.
    # also for some reason does not listen to system kill exception.
    spillover = ""
    while True:
        data = mpv_socket.recv(4096)
        lines = (spillover + data.decode('UTF-8', 'strict')).split('\n')
        spillover = ""
        for line in lines:
            if not line:
                continue
            if 'time-pos' not in line:
                log.info("< %s", line)
            # just forward everything raw to the websocket
            try:
                json_data = json.loads(line)
                socketio.send(json_data)
            except json.decoder.JSONDecodeError:
                spillover += line


def _test():
    """
    body_bytes = (json.dumps({
        "command": [
            "loadfile",
            "/Users/stevejohnson/Music/iTunes/iTunes Media/Music/Kid Condor/Kid Condor EP/01 Imagining.mp3"
        ]}) + '\n').encode('UTF-8')
    log.info("> %r", body_bytes)
    mpv_socket.sendall(body_bytes)
    """


def main(port=3001, socket_path="/tmp/mpv_socket"):
    mpv_process, mpv_socket = _run_mpv(socket_path)
    app.config['mpv_process'] = mpv_process
    app.config['mpv_socket'] = mpv_socket
    try:
        time.sleep(0.3)  # wait for mpv to start
        mpv_socket.connect(socket_path)
        t = eventlet.spawn(_listen_to_mpv, mpv_socket)
        #eventlet.spawn(_test)
        socketio.run(app, host="0.0.0.0", port=port)
    finally:
        t.kill()
        mpv_process.kill()
        mpv_socket.close()
        _kill_socket(socket_path)


if __name__ == '__main__':
    parser = ArgumentParser(
        description="Launches mpv and exposes its UNIX socket interface over a websocket")
    parser.add_argument('--mpv-websocket-port', type=int, default=3001)
    parser.add_argument('--mpv-socket-path', type=str, default='/tmp/mpv_socket')
    args = parser.parse_args()
    main(port=args.mpv_websocket_port, socket_path=args.mpv_socket_path)
