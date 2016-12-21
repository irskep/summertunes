import json
import os
import logging
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

PORT = 3001
SOCKET_PATH = '/tmp/mpv_socket'
def _kill_socket():
    try:
        os.unlink(SOCKET_PATH)
    except OSError:
        if os.path.exists(SOCKET_PATH):
            raise
_kill_socket()

mpv_process = Popen(
    [
        'mpv',
        '--quiet',
        '--audio-display=no',
        '--idle',
        '--gapless-audio',
        '--input-ipc-server', SOCKET_PATH
    ],
    # block keyboard input
    stdin=PIPE)
mpv_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) #pylint: disable=E1101

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

    mpv_socket.sendall(body_bytes)


def _listen_to_mpv():
    # this is bad for a few reasons.
    # mainly it doesn't recover from partially delivered data.
    spillover = ""
    while True:
        data = mpv_socket.recv(4096)
        if len(data) == 4096:
            log.error("Too much data: %r", data)
        else:
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


def test():
    """
    body_bytes = (json.dumps({
        "command": [
            "loadfile",
            "/Users/stevejohnson/Music/iTunes/iTunes Media/Music/Kid Condor/Kid Condor EP/01 Imagining.mp3"
        ]}) + '\n').encode('UTF-8')
    log.info("> %r", body_bytes)
    mpv_socket.sendall(body_bytes)
    """


if __name__ == '__main__':
    import time
    try:
        time.sleep(0.3)  # wait for mpv to start
        mpv_socket.connect(SOCKET_PATH)
        eventlet.spawn(_listen_to_mpv)
        eventlet.spawn(test)
        socketio.run(app, host="0.0.0.0", port=3001)
        raise KeyboardInterrupt
    finally:
        mpv_process.kill()
        mpv_socket.close()
        _kill_socket()
