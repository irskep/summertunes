import io
import os
import sys
from configparser import ConfigParser

import click

from beets import config

from summertunes.cli.run_mpv import run_mpv
from summertunes.cli.run_serve import run_serve
from summertunes.config_defaults import CONFIG_DEFAULTS

config.resolve()

CONFIG_DEFAULTS['beets_web_port'] = config['web']['port']

PATH_APP_DIR = click.get_app_dir('summertunes')
PATH_CONFIG = os.path.join(click.get_app_dir('summertunes'), 'summertunes.conf')
CONTEXT_SETTINGS = dict(
    help_option_names=['-h', '--help'],
    default_map={
        'mpv': CONFIG_DEFAULTS,
        'serve': CONFIG_DEFAULTS,
    }
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

    To run Summertunes, you'll need to run two commands in separate
    terminals:

    1. 'beet web', using the latest version of Beets (at this time, unreleased
       HEAD)

    2. 'summertunes mpv', which runs mpv and exposes its socket interface over
       a websocket.
    """


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
    '--dev-server-port', default=3000, help='Port to expose server on')
@click.option(
    '--beets-web-port', default=8337, help="Port that 'beet web' is running on")
@click.option(
    '--last-fm-api-key', default=None,
    help='last.fm API key for fetching album art')
@click.option(
    '--dev/--no-dev', default=False,
    help='If true, run using "npm start" instead of Python static file server. Default False.')
@click.option(
    '--mpv-enabled/--no-mpv-enabled', default=False,
    help="""If true, tell the client how to find the mpv websocket. Default
    True. Use --no-mpv-enabled if you are not running mpv.""")
@option_mpv_websocket_port
def serve(summertunes_port, beets_web_port, last_fm_api_key, dev, mpv_enabled, mpv_websocket_port):
    """Serve the Summertunes web interface"""
    run_serve(summertunes_port, beets_web_port, last_fm_api_key, dev, mpv_enabled, mpv_websocket_port)
