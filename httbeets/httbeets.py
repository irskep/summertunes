import logging
import re
from pathlib import Path
from subprocess import Popen, PIPE

from beets.ui import _configure, _open_library
from flask import Flask, send_from_directory, abort
from flask_cors import CORS
from flask_restful import Resource, Api, reqparse

log = logging.getLogger(__name__)

app = Flask(__name__, static_url_path='')
CORS(app)
api = Api(app)

beets_config = _configure({})
library = _open_library(beets_config)

tracks_parser = reqparse.RequestParser()
tracks_parser.add_argument('albumartist', type=str, default=None)
tracks_parser.add_argument('album', type=str, default=None)
tracks_parser.add_argument('id', type=str, default=None)

def _clause(key, value):
    # regex is nice in theory but it's slow as hell.
    #return '{}::^{}$'.format(key, re.escape(value))
    return '{}:{}'.format(key, re.escape(value))

def _beets_query_for_tracks_query():
    args = tracks_parser.parse_args()

    clauses = []
    if args.albumartist:
        clauses.append(_clause("albumartist", args.albumartist))
    if args.album:
        clauses.append(_clause("album", args.album))
    return 'artist+ year+ album+ disc+ track+ ' + ' '.join(clauses)

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

        query = _clause('albumartist', args.albumartist) if args.albumartist else ""
        with library.transaction():
            return {
                "albums": [
                    {k: getattr(a, k) for k in a.item_keys}
                    for a in
                    library.albums("year+ album+ " + query)
                ],
            }

class Tracks(Resource):
    def get(self):
        query = _beets_query_for_tracks_query()

        with library.transaction():
            return {
                "tracks": [_dictify(item) for item in library.items(query)]
            }

class Track(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('path', type=str, default=None)
        args = parser.parse_args()


        # this is kind of dumb: in-process beets can't find any tracks
        # by path, so we'll get the ID via the command line:
        query = "path:" + args.path
        command = [
            'beet',
            '--library', library.path.decode('UTF-8', 'strict'),
            'list',
            '--format', '$id',
            query
        ]
        with Popen(command, stdout=PIPE) as proc:
            query2 = "id:" + proc.stdout.read().decode('UTF-8', 'strict').strip()
        items = list(library.items(query2))

        with library.transaction():
            return {
                "track": [_dictify(item) for item in items][0]
            }

api.add_resource(Tracks, '/tracks')
api.add_resource(Track, '/track')
api.add_resource(Albums, '/albums')
api.add_resource(Artists, '/artists')

@app.route('/files/<path:path>')
def send_js(path):
    path = Path('/' + path)
    lib_path = Path(library.directory.decode('UTF-8', 'strict'))

    for a, b in zip(lib_path.parts, path.parts):
        if a != b:
            abort(404)  # "security"

    rel_path = path.relative_to(lib_path)

    return send_from_directory(str(lib_path), str(rel_path))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
