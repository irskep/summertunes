from beets.plugins import BeetsPlugin
from beetsplug.web import app as beetsweb_app

from summertunes.config_defaults import CONFIG_DEFAULTS
from summertunes.routes import summertunes_routes

class SummertunesPlugin(BeetsPlugin):
    def __init__(self):
        super(SummertunesPlugin, self).__init__()
        self.config.add(CONFIG_DEFAULTS)
beetsweb_app.register_blueprint(summertunes_routes, url_prefix="/summertunes")
