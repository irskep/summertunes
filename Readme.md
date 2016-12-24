## Requirements

Works on 3.5 and might work on 2.7.

## Setup

```sh
brew install mpv
pip install beets  # global on purpose!
echo "export default {};" > client/apiKeys.js  # no album art for you (yet)!
# ok now import your entire mp3 collection into beets, no big deal

cd client
npm install
cd ..

mkvirtualenv summertunes
pip install -r requirements.txt
# you may need to install your beets plugins into your virtualenv.
python summertunes.py
```

In your web browser, visit `http://localhost:3000/`.

![](https://www.dropbox.com/s/hxwiumtdh72v8zp/Screenshot%202016-12-23%2018.22.19.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
