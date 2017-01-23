# Requirements

Works on Python 3.5 and might work on 2.7.

# Setup

## Installation

### Install mpv on your platform
```sh
brew install mpv
```

### Install dependencies (beets must come from master branch, not last release)
```sh
pip install -r requirements.txt
pip install .
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
summertunes mpv
```

### In terminal C, serve the Summertunes web interface

```sh
summertunes serve
```

In your web browser, visit `http://localhost:3000/`.

# Configuration

Summertunes currently reads a config file in the working directory called
`summertunes.conf`. For now there isn't much interesting in there except
port assignments. Here are its default values:

```conf
[summertunes]
last_fm_api_key =
port = 3000

[player.mpv]
enabled = true
port = 3001
socket_path = /tmp/mpv_socket

[beets.web]
port = 8337
```

# Command Line

## Main

```sh
> summertunes -h
Usage: summertunes [OPTIONS] COMMAND [ARGS]...

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

Options:
  --no-config-prompt  If passed, never ask to create a config if none exists
  -h, --help          Show this message and exit.

Commands:
  config  Prints the current or default configuration
  mpv     Run an instance of mpv, configured to be...
  serve   Serve the Summertunes web interface
```

## `summertunes mpv`

```sh
> summertunes mpv -h
Usage: summertunes mpv [OPTIONS]

  Run an instance of mpv, configured to be reachable by 'summertunes serve'

Options:
  --mpv-websocket-port INTEGER  Port to expose mpv websocket on
  --mpv-socket-path TEXT        Path to use for mpv's UNIX socket
  -h, --help                    Show this message and exit.
```

## `summertunes serve`

```sh
> summertunes serve -h
Usage: summertunes serve [OPTIONS]

  Serve the Summertunes web interface

Options:
  --summertunes-port INTEGER      Port to expose server on
  --beets-web-port INTEGER        Port that 'beet web' is running on
  --last-fm-api-key TEXT          last.fm API key for fetching album art
  --dev / --no-dev                If true, run using "npm start" instead of
                                  Python static file server. Default False.
  --enable-mpv / --no-enable-mpv  If true, tell the client how to find the mpv
                                  websocket. Default
                                  True. Use --no-enable-mpv
                                  if you are not running mpv.
  --mpv-websocket-port INTEGER    Port to expose mpv websocket on
  -h, --help                      Show this message and exit.
  ```

![](https://www.dropbox.com/s/i1yf42p5vu7eidt/Screenshot%202017-01-17%2012.59.32.png?dl=1)

![](https://www.dropbox.com/s/r5gz3ijisx5h4pr/Screenshot%202017-01-17%2013.00.00.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
