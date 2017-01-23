import json
import logging
import os
from pathlib import Path
from subprocess import Popen

from flask import Flask, send_from_directory

my_dir = Path(os.path.abspath(__file__)).parent
STATIC_FOLDER = os.path.abspath(str(my_dir / '..' / 'static'))
INNER_STATIC_FOLDER = os.path.abspath(str(Path(STATIC_FOLDER) / 'static'))

log = logging.getLogger(__name__)
logging.basicConfig()
app = Flask(__name__, static_folder=INNER_STATIC_FOLDER, static_url_path='/static')


@app.route('/server_config.js')
def r_server_config():
    return json.dumps(app.config['SERVER_CONFIG'])


@app.route('/')
def r_index():
    return send_from_directory(STATIC_FOLDER, 'index.html')


@app.route('/<path:path>')
def r_files(path):
    return send_from_directory(STATIC_FOLDER, path)


def run_serve(summertunes_port, beets_web_port, last_fm_api_key, dev, enable_mpv, mpv_websocket_port):
    """Serve Summertunes with the given config"""
    app.config['SERVER_CONFIG'] = {
        'MPV_PORT': mpv_websocket_port,
        'BEETSWEB_PORT': beets_web_port,
        'player_services': ['html5', 'mpv'] if enable_mpv else ['html5'],
        'LAST_FM_API_KEY': last_fm_api_key,
    }

    dev_client_path = my_dir / '..' / '..' / 'client'
    dev_client_public_path = dev_client_path / 'public'

    if dev:
        with (dev_client_public_path / 'server_config.js').open('w') as f_config:
            f_config.write(json.dumps(app.config['SERVER_CONFIG']))
        proc = Popen(['npm', 'start'], cwd=str(dev_client_path))
        proc.wait()
    else:
        app.run(host='0.0.0.0', port=summertunes_port,
                debug=True, threaded=True)
