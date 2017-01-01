## Requirements

Works on Python 3.5 and might work on 2.7.

## Setup

```sh
# install mpv on your platform
brew install mpv

# install beets globally
pip install beets
# this file does not exist for you. add a lastFM: "API_KEY" entry
# to get album art.
echo "export default {};" > client/apiKeys.js
# import your files into beets without rewriting tags or copying
beet import -A -C /folder/of/files

# install JS dependencies
# (this step will go away in the future)
cd client
npm install
cd ..

# install Python dependencies
mkvirtualenv summertunes
pip install -r requirements.txt
# if you have beets plugins, you may need to install them
# into the virtualenv as well.

# run everything:
python summertunes.py
```

In your web browser, visit `http://localhost:3000/`.

## Configuration

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

## Command Line

```sh
> ./summertunes.py -h
usage: summertunes.py [-h] [--web-interface-port WEB_INTERFACE_PORT] [--dev]
                      [--debug-args] [--print-default-config]
                      [--player-services PLAYER_SERVICES]
                      [--disable-player-services PLAYER_SERVICES]
                      [--library-services LIBRARY_SERVICES]
                      [--disable-library-services LIBRARY_SERVICES]
                      [--mpv-websocket-port MPV_WEBSOCKET_PORT]
                      [--mpv-socket-path MPV_SOCKET_PATH]
                      [--httbeets-port HTTBEETS_PORT]

Run the Summertunes web frontend and whatever backends you want

optional arguments:
  -h, --help            show this help message and exit
  --web-interface-port WEB_INTERFACE_PORT
                        Serve the web interface from this port
  --dev                 Run debug node server with livereload
  --debug-args          Show parsed arg values and exit
  --print-default-config
                        Print default config and exit
  --player-services PLAYER_SERVICES
                        Players to expose to the web interface (default
                        {'mpv', 'html5'}). Example: 'mpv,html5'
  --disable-player-services PLAYER_SERVICES
                        Remove a previously added player service
  --library-services LIBRARY_SERVICES
  --disable-library-services LIBRARY_SERVICES

mpv arguments:
  --mpv-websocket-port MPV_WEBSOCKET_PORT
  --mpv-socket-path MPV_SOCKET_PATH

httbeets arguments:
  --httbeets-port HTTBEETS_PORT
```

![](https://www.dropbox.com/s/459k4m9mkaj67sy/Screenshot%202016-12-23%2019.08.01.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
