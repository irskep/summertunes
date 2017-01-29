import json
import logging
import os
from pathlib import Path
from subprocess import Popen

from flask import Flask, send_from_directory, abort, send_file

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

@app.route('/files/<path:path>')
def r_send_file(path):
    print(path)
    log.info(path)
    path = '/' + path

    is_ok = False
    for ext in {'mp3', 'mp4a', 'aac', 'flac', 'ogg', 'wav', 'alac'}:
        if path.lower().endswith("." + ext):
            is_ok = True
            break
    if not is_ok:
        abort(404)  # "security"

    response = send_file(
        path,
        as_attachment=True,
        attachment_filename=os.path.basename(path),
    )
    response.headers['Content-Length'] = os.path.getsize(path)
    return response

@app.route('/<path:path>')
def r_files(path):
    return send_from_directory(STATIC_FOLDER, path)


def run_serve(summertunes_port, beets_web_port, last_fm_api_key, dev, enable_mpv, mpv_websocket_port):
    """Serve Summertunes with the given config"""
    app.config['SERVER_CONFIG'] = {
        'MPV_PORT': mpv_websocket_port,
        'BEETSWEB_PORT': beets_web_port,
        'SUMMERTUNES_PORT': summertunes_port,
        'player_services': ['web', 'mpv'] if enable_mpv else ['web'],
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
                debug=False, threaded=True)
