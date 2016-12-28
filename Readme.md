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

![](https://www.dropbox.com/s/459k4m9mkaj67sy/Screenshot%202016-12-23%2019.08.01.png?dl=1)

![](https://www.dropbox.com/s/idcmdhrwre56cov/Screenshot%202016-12-23%2018.24.54.png?dl=1)
