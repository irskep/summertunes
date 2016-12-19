import json
import os
import logging
from subprocess import Popen

import eventlet
from eventlet.green import socket
from flask import Flask
from flask_socketio import SocketIO

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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

mpv_process = Popen(['mpv', '--quiet', '--audio-display=no', '--idle', '--input-ipc-server', SOCKET_PATH])
mpv_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) #pylint: disable=E1101

@socketio.on('message')
def handle_json(body):
    body_bytes = (json.dumps(body) + '\n').encode('UTF-8')
    log.info("> %r", body_bytes)
    mpv_socket.sendall(body_bytes)


def _listen_to_mpv():
    while True:
        data = mpv_socket.recv(4096)
        if len(data) == 4096:
            log.error("Too much data: %r", data)
        else:
            lines = data.decode('UTF-8', 'strict').split('\n')
            for line in lines:
                if not line:
                    continue
                if 'time-pos' not in line:
                    log.info("< %s", line)
                # just forward everything raw to the websocket
                socketio.send(json.loads(line))


if __name__ == '__main__':
    import time
    try:
        time.sleep(0.3)  # wait for mpv to start
        mpv_socket.connect(SOCKET_PATH)
        eventlet.spawn(_listen_to_mpv)
        socketio.run(app, port=3001)
    finally:
        mpv_process.kill()
        mpv_socket.close()
        _kill_socket()