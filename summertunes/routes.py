import json
import logging
import os
from pathlib import Path

import flask
from flask import g
from flask import send_from_directory, abort, send_file, Blueprint
from beets import config
from beets.library import PathQuery

my_dir = Path(os.path.abspath(__file__)).parent
STATIC_FOLDER = os.path.abspath(str(my_dir / 'static'))
INNER_STATIC_FOLDER = os.path.abspath(str(Path(STATIC_FOLDER) / 'static'))

log = logging.getLogger(__name__)
summertunes_routes = Blueprint(
    'summertunes',
    'summertunes',
    static_folder=INNER_STATIC_FOLDER,
    static_url_path='/static')


def get_is_path_safe(flask_app, path):
    if hasattr(g, 'lib'):
        # if running as a beets plugin, only return files that are in beets's library
        query = PathQuery('path', path.encode('utf-8'))
        item = g.lib.items(query).get()
        return bool(item)
    else:
        # if not running as a beets plugin, we don't determine whether files are in the
        # library or not, so stick to just returning files that are "probably audio."
        for ext in {'mp3', 'mp4a', 'aac', 'flac', 'ogg', 'wav', 'alac'}:
            if path.lower().endswith("." + ext):
                return True
        return False


@summertunes_routes.route('/server_config.js')
def r_server_config():
    return json.dumps({
        'MPV_PORT': config['summertunes']['mpv_websocket_port'].get(),
        'BEETSWEB_PORT': config['web']['port'].get(),
        'player_services': ['web', 'mpv'] if config['summertunes']['mpv_enabled'].get() else ['web'],
        'LAST_FM_API_KEY': config['summertunes']['last_fm_api_key'].get(),
    })


@summertunes_routes.route('/')
def r_index():
    return send_from_directory(STATIC_FOLDER, 'index.html')

@summertunes_routes.route('/files/<path:path>')
def r_send_file(path):
    path = '/' + path

    if not get_is_path_safe(flask.current_app, path):
        return abort(404)

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
