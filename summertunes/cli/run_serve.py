import json
import logging
import os
from pathlib import Path
from subprocess import Popen

from flask import Flask, redirect
from werkzeug.routing import PathConverter

my_dir = Path(os.path.abspath(__file__)).parent
STATIC_FOLDER = os.path.abspath(str(my_dir / '..' / 'static'))
INNER_STATIC_FOLDER = os.path.abspath(str(Path(STATIC_FOLDER) / 'static'))

log = logging.getLogger(__name__)
logging.basicConfig()
app = Flask(__name__)

# need to register the 'everything' type before we try to define routes
# that use it
class EverythingConverter(PathConverter):
    regex = '.*?'
app.url_map.converters['everything'] = EverythingConverter

from summertunes.routes import summertunes_routes
app.register_blueprint(summertunes_routes, url_prefix='/summertunes')

@app.route("/")
def r_redirect():
    return redirect("/", code=301)


def run_serve(summertunes_port, beets_web_port, last_fm_api_key, dev, enable_mpv, mpv_websocket_port):
    """Serve Summertunes with the given config"""
    app.config['SERVER_CONFIG'] = {
        'MPV_PORT': mpv_websocket_port,
        'BEETSWEB_PORT': beets_web_port,
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
                debug=True, threaded=True)
