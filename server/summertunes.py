from beets.ui import _configure, _open_library
from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api, reqparse
from play_music import play_music

app = Flask(__name__)
CORS(app)
api = Api(app)

beets_config = _configure({})
library = _open_library(beets_config)

tracks_parser = reqparse.RequestParser()
tracks_parser.add_argument('albumartist', type=str, default=None)
tracks_parser.add_argument('album', type=str, default=None)
tracks_parser.add_argument('id', type=str, default=None)

play_process = None
def _stop():
    global play_process
    if play_process:
        play_process.kill()
        play_process = None

def _beets_query_for_tracks_query():
    args = tracks_parser.parse_args()

    clauses = []
    if args.albumartist:
        clauses.append('albumartist:{}'.format(args.albumartist))
    if args.album:
        clauses.append('album:{}'.format(args.album))
    return 'artist+ year+ album+ disc+ track+ ' + ' , '.join(clauses)

def _dictify(item):
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
    def get(self):
        query = _beets_query_for_tracks_query()

        with library.transaction():
            return {
                "tracks": [_dictify(item) for item in library.items(query)]
            }

class Play(Resource):
    def get(self):
        _stop()
        args = tracks_parser.parse_args()
        found = False
        paths = []
        for item in library.items(_beets_query_for_tracks_query()):
            if found or args.id == str(item.id) or args.id is None:
                found = True
            if found:
                paths.append(item.path)

        global play_process
        play_process = play_music(library, beets_config, paths)

        with library.transaction():
            return {
                "success": len(paths) > 0,
            }

class Stop(Resource):
    def get(self):
        _stop()

api.add_resource(Tracks, '/tracks')
api.add_resource(Albums, '/albums')
api.add_resource(Artists, '/artists')
api.add_resource(Play, '/play')
api.add_resource(Stop, '/stop')

if __name__ == '__main__':
    try:
        app.run(debug=True)
    except SystemExit as e:
        _stop()
        raise e
