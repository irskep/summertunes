# Summertunes

Summertunes is a web-based music player that can control mpv on a server, or
play back audio in your browser.

## Requirements

Python 3.5; beets >=1.4.4; mpv

![](https://www.dropbox.com/s/i1yf42p5vu7eidt/Screenshot%202017-01-17%2012.59.32.png?dl=1)

## Installation


```sh
# Install mpv on your platform
brew install mpv
# Install summertunes from PyPI
pip install summertunes
```

Add this to your beets config (on OS X, at `~/.config/beets/config.yaml`):

```yaml
plugins: web summertunes
web:
    include_paths: true  # without this, summertunes can't control mpv
```

If you haven't used beets before, import your files into beets without rewriting tags or copying:

```sh
beet import -A -C /folder/of/files
```

## Running

In terminal A, run `beet web`:

```sh
beet web
```

In terminal B, use summertunes to run mpv:

```sh
summertunes mpv
```

In your web browser, visit `http://localhost:8337/summertunes/`.

**The normal `beet web` interface is still at `http://localhost:8337/`. Summertunes
is served at `/summertunes/`.**

## Configuration

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


## Developing

### Client

You'll need npm installed to develop the client. To get the auto-reloading dev server
running, install some stuff:

```sh
cd client
npm install
pip install -r requirements.txt
pip install --editable .
```

Update your beets config to allow CORS headers in `beet web`:

```yaml
web:
    cors: '*'
    host: 0.0.0.0
    include_paths: true
```

Now you can run this in one terminal to serve the JS (but not the API):

```sh
summertunes serve --dev  # serves JS
```

And keep `beet web` running in another terminal, with the config changes above,
so the JS has something to talk to.

### Server

```sh
pip install --editable .
beet web --debug # auto-reloads when you change files
```

### Both

Run `summertunes serve --dev` in one terminal and `beet web --debug` in another.