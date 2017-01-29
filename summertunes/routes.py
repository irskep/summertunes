import json
import logging
import os
from pathlib import Path

import flask
from flask import send_from_directory, abort, send_file, Blueprint

my_dir = Path(os.path.abspath(__file__)).parent
STATIC_FOLDER = os.path.abspath(str(my_dir / 'static'))
INNER_STATIC_FOLDER = os.path.abspath(str(Path(STATIC_FOLDER) / 'static'))

log = logging.getLogger(__name__)
summertunes_routes = Blueprint('summertunes', 'summertunes', static_folder=INNER_STATIC_FOLDER, static_url_path='/static')


@summertunes_routes.route('/server_config.js')
def r_server_config():
    return json.dumps(flask.current_app.config['SERVER_CONFIG'])


@summertunes_routes.route('/')
def r_index():
    return send_from_directory(STATIC_FOLDER, 'index.html')

@summertunes_routes.route('/files/<path:path>')
def r_send_file(path):
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

@summertunes_routes.route('/<path:path>')
def r_files(path):
    return send_from_directory(STATIC_FOLDER, path)
