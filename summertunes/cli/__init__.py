import io
import os
import sys
from configparser import ConfigParser

import click

from summertunes.cli.run_mpv import run_mpv
from summertunes.cli.run_serve import run_serve

DEFAULT_CONFIG = """
[summertunes]
last_fm_api_key =
port = 3000

[player.mpv]
enabled = true
port = 3001
socket_path = /tmp/mpv_socket

[beets.web]
port = 8337
""".strip()

PATH_APP_DIR = click.get_app_dir('summertunes')
PATH_CONFIG = os.path.join(click.get_app_dir('summertunes'), 'summertunes.conf')
CONFIG = ConfigParser()
CONFIG.read_string(DEFAULT_CONFIG)
if os.path.exists(PATH_CONFIG):
    CONFIG.read(PATH_CONFIG)

S_CONFIG_FILE_CREATION_PROMPT = """
No config file exists yet. Things will work, but shall I create one for you?
It will be at this path:

  {path}

(Pass --no-config-prompt to suppress this prompt in the future.)
""".strip() + '\n'


CONFIG_FILE_VALUES = {
    'mpv': {
        'mpv_websocket_port': CONFIG.getint('player.mpv', 'port', fallback=3001),
        'mpv_socket_path': CONFIG.get('mpv', 'socket_path', fallback='/tmp/mpv_socket'),
    },
    'serve': {
        'last_fm_api_key': CONFIG.get('summertunes', 'last_fm_api_key', fallback=None),
        'summertunes_port': CONFIG.getint('summertunes', 'port', fallback=3000),
        'beets_web_port': CONFIG.getint('beets.web', 'port', fallback=8337),
        'mpv_websocket_port': CONFIG.getint('player.mpv', 'port', fallback=3001),
        'mpv_socket_path': CONFIG.get('mpv', 'socket_path', fallback='/tmp/mpv_socket'),
        'enable_mpv': CONFIG.getboolean('mpv', 'enabled', fallback=True),
    },
}
CONTEXT_SETTINGS = dict(
    help_option_names=['-h', '--help'],
    default_map=CONFIG_FILE_VALUES
)


def option_mpv_websocket_port(func):
    return click.option(
        '--mpv-websocket-port', default=3001, help='Port to expose mpv websocket on'
    )(func)


@click.group(context_settings=CONTEXT_SETTINGS)
@click.option(
    '--no-config-prompt', default=False, is_flag=True,
    help='If passed, never ask to create a config if none exists')
@click.pass_context
def cli(ctx, no_config_prompt):
    """
    Summertunes is a web interface for the Beets local music database and mpv
    audio/video player that gives you an iTunes-like experience in your web
    browser.

    To run Summertunes, you'll need to run three commands in separate
    terminals:

    1. 'beet web', using the latest version of Beets (at this time, unreleased
       HEAD)

    2. 'summertunes mpv', which runs mpv and exposes its socket interface over
       a websocket.

    3. 'summertunes serve', which serves the web interface.

    Numbers 2 and 3 are run separately because if the web server gets wedged,
    your music will keep playing while you restart it.
    """

    isatty = os.isatty(sys.stdout.fileno())
    # a little hacky but eh:
    will_display_help = '-h' in sys.argv or '--help' in sys.argv
    may_prompt_config = not (no_config_prompt or isatty or will_display_help)

    if may_prompt_config and not os.path.exists(PATH_CONFIG):
        if click.confirm(S_CONFIG_FILE_CREATION_PROMPT.format(path=PATH_CONFIG)):
            os.makedirs(PATH_APP_DIR)
            with open(PATH_CONFIG, 'w') as f_config:
                f_config.write(DEFAULT_CONFIG)

    ctx.obj = {'config': CONFIG}


@cli.command()
@option_mpv_websocket_port
@click.option(
    '--mpv-socket-path', default='/tmp/mpv_socket',
    help="Path to use for mpv's UNIX socket")
def mpv(mpv_websocket_port, mpv_socket_path):
    """Run an instance of mpv, configured to be reachable by 'summertunes serve'"""
    run_mpv(mpv_websocket_port, mpv_socket_path)


@cli.command([])
@click.option(
    '--summertunes-port', default=3000, help='Port to expose server on')
@click.option(
    '--beets-web-port', default=8337, help="Port that 'beet web' is running on")
@click.option(
    '--last-fm-api-key', default=None,
    help='last.fm API key for fetching album art')
@click.option(
    '--dev/--no-dev', default=False,
    help='If true, run using "npm start" instead of Python static file server. Default False.')
@click.option(
    '--enable-mpv/--no-enable-mpv', default=False,
    help="""If true, tell the client how to find the mpv websocket. Default
    True. Use --no-enable-mpv if you are not running mpv.""")
@option_mpv_websocket_port
def serve(summertunes_port, beets_web_port, last_fm_api_key, dev, enable_mpv, mpv_websocket_port):
    """Serve the Summertunes web interface"""
    run_serve(summertunes_port, beets_web_port, last_fm_api_key, dev, enable_mpv, mpv_websocket_port)


@cli.command(help="Prints the current or default configuration")
@click.option(
    '--default', default=False, is_flag=True,
    help='If true, prints the default config instead of current one')
def config(default):
    if default:
        click.echo(DEFAULT_CONFIG)
    else:
        f_config = io.StringIO()
        CONFIG.write(f_config)
        click.echo(f_config.getvalue())


@cli.command(help="Prints the config path")
def config_path():
    click.echo(PATH_CONFIG)
