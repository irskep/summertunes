from beets.library import Library
from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api, reqparse

app = Flask(__name__)
CORS(app)
api = Api(app)

library = Library(path="/Users/steve/.config/beets/library.db", directory="/Volumes/SteveJStorage/Music")

class Artists(Resource):
    def get(self):
        artist_names = set()
        with library.transaction():
            for album in library.albums():
                artist_names.add(album.albumartist)
        return {
            "artists": sorted(artist_names)
        }

class Albums(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('albumartist', type=str, default=None)
        args = parser.parse_args()

        clauses = []
        if args.albumartist:
            clauses.append('albumartist:{}'.format(args.albumartist))

        with library.transaction():
            return {
                "albums": [
                    {k: getattr(a, k) for k in a.item_keys}
                    for a in
                    library.albums("year+ album+ " + ' , '.join(clauses))
                ],
            }

class Tracks(Resource):
    def _dictify(self, item):
        result = {}
        for k in item._fields:
            if k.startswith('acoustid'):
                continue
            v = getattr(item, k)
            if isinstance(v, bytes):
                result[k] = v.decode('utf-8', 'strict')
            else:
                result[k] = v
        return result

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('albumartist', type=str, default=None)
        parser.add_argument('album', type=str, default=None)
        args = parser.parse_args()

        clauses = []
        if args.albumartist:
            clauses.append('albumartist:{}'.format(args.albumartist))
        if args.album:
            clauses.append('album:{}'.format(args.album))

        with library.transaction():
            return {
                "tracks": [
                    self._dictify(item)
                    for item
                    in library.items('artist+ year+ album+ disc+ track+ ' + ' , '.join(clauses))
                ]
            }

api.add_resource(Tracks, '/tracks')
api.add_resource(Albums, '/albums')
api.add_resource(Artists, '/artists')

if __name__ == '__main__':
    app.run(debug=True)
