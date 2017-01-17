# Requirements

Works on Python 3.5 and might work on 2.7.

# Setup

## Installation

### Install mpv on your platform
```sh
brew install mpv
```

### Install dependencies (beets must come from master, not last release)
```sh
pip install -r requirements.txt
```

### Add this to your beets config (on OS X, at `~/.config/beets/config.yaml`):
```yaml
web:
    cors: '*'
    host: 0.0.0.0
    include_paths: true
```

### Import your files into beets without rewriting tags or copying

Skip this step if you already use beets to manage your library.

```sh
beet import -A -C /folder/of/files
```

## Running

### In terminal A, run beet web

```sh
beet web
```

### In terminal B, run mpv via summertunes so it uses the right config and gets a websocket

```sh
./summertunes.py --run-mpv
```

### In terminal C, serve the Summertunes web interface

```sh
python summertunes.py
```

In your web browser, visit `http://localhost:3000/`.

# Configuration

Summertunes currently reads a config file in the working directory called
`summertunes.conf`. For now there isn't much interesting in there except
port assignments. Here are its default values:

```conf
[summertunes]
port = 3000

[player.html5]
enabled = true

[player.mpv]
enabled = true
port = 3001
socket_path = /tmp/mpv_socket

[library.httbeets]
enabled = true
port = 3002
```

# Command Line

```sh
> ./summertunes.py -h
usage: summertunes.py [-h] [--web-interface-port WEB_INTERFACE_PORT] [--dev]
                      [--debug-args] [--print-default-config] [--run-mpv]
                      [--player-services PLAYER_SERVICES]
                      [--disable-player-services PLAYER_SERVICES]
                      [--mpv-websocket-port MPV_WEBSOCKET_PORT]
                      [--mpv-socket-path MPV_SOCKET_PATH]
                      [--beets-web-port BEETS_WEB_PORT]

Run the Summertunes web frontend and whatever backends you want

optional arguments:
  -h, --help            show this help message and exit
  --web-interface-port WEB_INTERFACE_PORT
                        Serve the web interface from this port
  --dev                 Run debug node server with livereload
  --debug-args          Show parsed arg values and exit
  --print-default-config
                        Print default config and exit
  --run-mpv             Instead of running summertunes, run mpv to match the
                        current config
  --player-services PLAYER_SERVICES
                        Players to expose to the web interface (default
                        {'mpv', 'html5'}). Example: mpv,html5
  --disable-player-services PLAYER_SERVICES
                        Remove a previously added player service

mpv arguments:
  --mpv-websocket-port MPV_WEBSOCKET_PORT
  --mpv-socket-path MPV_SOCKET_PATH

beets web arguments:
  --beets-web-port BEETS_WEB_PORT
                        'beet web' is serving on this port
```

![](https://www.dropbox.com/s/459k4m9mkaj67sy/Screenshot%202016-12-23%2019.08.01.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
