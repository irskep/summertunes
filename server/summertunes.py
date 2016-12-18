from pathlib import Path

from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api

app = Flask(__name__)
CORS(app)
api = Api(app)

ROOT = Path("/Volumes/SteveJStorage/Music")

class Artists(Resource):
    def get(self):
        return {"artists": [p.name for p in ROOT.iterdir() if p.is_dir()]}

class Albums(Resource):
    def get(self, artist_name):
        return {"albums": [p.name for p in (ROOT / artist_name).iterdir() if p.is_dir()]}

class Tracks(Resource):
    def get(self, artist_name, album_name):
        return {"tracks": [p.name for p in (ROOT / artist_name / album_name).iterdir() if p.is_dir()]}

api.add_resource(Tracks, '/artists/<string:artist_name>/<string:album_name>')
api.add_resource(Albums, '/artists/<string:artist_name>')
api.add_resource(Artists, '/artists')

if __name__ == '__main__':
    app.run(debug=True)
