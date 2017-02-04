# Requirements

Python 3.5; beets >=1.4.4; mpv

![](https://www.dropbox.com/s/i1yf42p5vu7eidt/Screenshot%202017-01-17%2012.59.32.png?dl=1)


# Setup

## Installation

### Install mpv on your platform
```sh
brew install mpv
```

### Install dependencies (beets must come from master branch, not last release, since 1.4.4 isn't out yet)
```sh
pip install -r requirements.txt
pip install .
```

### Add this to your beets config (on OS X, at `~/.config/beets/config.yaml`):
```yaml
plugins: web summertunes
web:
    include_paths: true  # without this, summertunes can't control mpv
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

In your web browser, visit `http://localhost:8337/`.

# Configuration

Summertunes is configured using your beets config file. Here are its defaults:

```yaml
summertunes:
    # port to serve mpv websocket from
    mpv_websocket_port: 3001
    # path to use for socket; should be no files with this path
    mpv_socket_path: /tmp/mpv_socket
    # show mpv in web interface? otherwise just allow web playback
    mpv_enabled: yes
    # last.fm API key, used to fetch album art
    last_fm_api_key: ''
    # if using 'summertunes serve' development server, use this port
    dev_server_port: 3000
```

![](https://www.dropbox.com/s/r5gz3ijisx5h4pr/Screenshot%202017-01-17%2013.00.00.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
