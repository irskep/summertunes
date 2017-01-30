from beets.plugins import BeetsPlugin
from beetsplug.web import app as beetsweb_app

from summertunes.routes import summertunes_routes

class SummertunesPlugin(BeetsPlugin):
    def __init__(self):
        super(SummertunesPlugin, self).__init__()
        beetsweb_app.config['SERVER_CONFIG'] = {
            'MPV_PORT': 3001,
            'BEETSWEB_PORT': 8337,
            'SUMMERTUNES_PORT': 8337,
            'player_services': ['web', 'mpv'],
            'LAST_FM_API_KEY': "",
        }
beetsweb_app.register_blueprint(summertunes_routes, url_prefix="/summertunes")
