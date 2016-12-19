## Requirements

Tested on Python 3.5 only. It *might* run on 2.7 though!

## Setup

Before everything:

```
brew install mpv
pip install beets
# ok now import your entire mp3 collection into beets, no big deal
```

In one terminal:

```sh
cd server
mkvirtualenv summertunes
pip install -r requirements.txt
python summertunes.py
```

In a second terminal:

```
cd client
npm install
npm start
```

In your web browser, visit `http://localhost:3000/`.

![](https://www.dropbox.com/s/49kec9os2v4h4wh/Screenshot%202016-12-18%2010.53.50.png?dl=1)