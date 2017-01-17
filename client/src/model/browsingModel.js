import K from "kefir";
import { kBeetsWebURL } from "../config";
import createBus from "./createBus";
import parseURLQuery from "../util/parseURLQuery";
import makeURLQuery from "../util/makeURLQuery";

/// pass {artist, album, id}
export default function albumQueryString({album_id, albumartist}) {
  if (album_id) {
    return `album_id:${album_id}`;
  } else {
    return `albumartist:${albumartist}`;
  }
};

window.K = K;

/* utils */

const keepAlive = (observable) => observable.onValue(() => { })
const keyMapper = (k) => (obj) => obj[k] || null;

/* URL data */

let latestURLData = null;
const getURLData = () => {
  if (!window.location.search) return {artist: null, album: null};
  latestURLData = {
    artist: null,
    album: null,
    ...parseURLQuery(window.location.search.slice(1)),
  };
  return latestURLData;
}
const [sendStatePushed, statePushes] = createBus();
const urlDataChanges = K.fromEvents(window, 'popstate')
  .merge(statePushes)
  .merge(K.constant(null))
  .map(getURLData);

const updateTitle = (newURLData) => {
  let newTitle = "Summertunes";
  if (newURLData.artist) newTitle += ` - ${newURLData.artist}`;
  if (newURLData.album) newTitle += ` - ${newURLData.album}`;
  document.title = newTitle;
};

updateTitle(getURLData());

const urlUpdater = (k) => (arg) => {
  const newURLData = {
    ...latestURLData,
    [k]: arg,
  }
  latestURLData = newURLData;
  history.pushState(null, "", makeURLQuery(newURLData));
  updateTitle(newURLData);
  sendStatePushed();
}

/* data */

const kAllAlbums = kBeetsWebURL
  .flatMapLatest((url) => {
    return K.fromPromise(
        window.fetch(`${url}/album/`)
          .then((response) => response.json())
          .then(({albums}) => albums.sort((a, b) => a.album < b.album ? -1 : 1)))
  })
  .toProperty(() => [])
keepAlive(kAllAlbums);

const kAlbumsByArtist = kAllAlbums
  .map((albums) => {
    const albumsByArtist = {};
    for (const album of albums) {
      if (!albumsByArtist[album.albumartist]) {
        albumsByArtist[album.albumartist] = [];
      }
      albumsByArtist[album.albumartist].push(album);
    }
    for (const k of Object.keys(albumsByArtist)) {
      albumsByArtist[k].sort((a, b) => {
        if (a.year !== b.year) {
          return a.year > b.year ? 1 : -1;
        } else {
          return a.album > b.album ? 1 : -1;
        }
      });
    }
    return albumsByArtist;
  })
  .toProperty(() => {})
keepAlive(kAllAlbums);

const kArtists = kAlbumsByArtist
  .map((albumsByArtist) => {
    return Object.keys(albumsByArtist).sort((a, b) => a > b ? 1 : -1);
  });
keepAlive(kArtists);


const setArtist = urlUpdater('artist');
const kArtist = urlDataChanges.map(keyMapper('artist'))
  .skipDuplicates()
  .toProperty(() => getURLData()['artist'])
keepAlive(kArtist);

const kAlbums = K.combine([kAlbumsByArtist, kArtist, kAllAlbums])
  .map(([albumsByArtist, artistName, allAlbums]) => {
    if (artistName) {
      return albumsByArtist[artistName] || [];
    } else {
      return allAlbums;
    }
  })
  .toProperty(() => []);
keepAlive(kAlbums);

const setAlbum = urlUpdater('album');
const kAlbum = kArtist.map(() => null).skip(1)  // don't zap initial load
  .merge(urlDataChanges.map(keyMapper('album')))
  .skipDuplicates()
  .toProperty(() => getURLData()['album'])
keepAlive(kAlbum);

const kTrackList = K.combine([kBeetsWebURL, kArtist, kAlbum])
  .flatMapLatest(([serverURL, artist, album]) => {
    if (!artist && !album) return K.constant([])
    const url = `${serverURL}/item/query/${albumQueryString({albumartist: artist, album_id: album})}`;
    return K.fromPromise(
      window.fetch(url)
        .then((response) => response.json())
        .then(({results}) => results)
    );
  })
  .toProperty(() => []);

const [setTrackIndex, bTrackIndex] = createBus()
const kTrackIndex = bTrackIndex
  .merge(kTrackList.changes().map(() => null))
  .toProperty(() => null);
keepAlive(kTrackIndex);

const kTrack = K.combine([kTrackList, kTrackIndex], (trackList, trackIndex) => {
  if (trackIndex === null) return null;
  if (trackList.length < 1) return null;
  if (trackIndex >= trackList.length) return null;
  return trackList[trackIndex];
}).toProperty(() => null);
keepAlive(kTrack);

const kPlayerQueueGetter = K.combine([kTrackList, kTrackIndex], (trackList, trackIndex) => {
  return (overrideTrackIndex = null) => {
    const actualTrackIndex = overrideTrackIndex === null ? trackIndex : overrideTrackIndex;
    if (actualTrackIndex === null) return [];
    if (trackList.length < 1) return [];
    if (actualTrackIndex >= trackList.length) return [];
    return trackList.slice(actualTrackIndex);
  }
}).toProperty(() => () => []);
keepAlive(kPlayerQueueGetter);

/* filterable artists/albums */

const [setArtistFilter, bArtistFilter] = createBus();
const kArtistFilter = bArtistFilter.toProperty(() => "");
const [setAlbumFilter, bAlbumFilter] = createBus();
const kAlbumFilter = bAlbumFilter.toProperty(() => "");

const kFilteredArtists = K.combine([kArtists, kArtistFilter.debounce(300)], (artists, filter) => {
  filter = filter.toLocaleLowerCase();
  if (!filter) return artists;
  if (!artists) return [];
  return artists.filter((a) => a.toLocaleLowerCase().indexOf(filter) > -1);
}).toProperty(() => []);

const kFilteredAlbums = K.combine([kAlbums, kAlbumFilter.debounce(300)], (albums, filter) => {
  filter = filter.toLocaleLowerCase();
  if (!filter) return albums;
  if (!albums) return [];
  return albums.filter((a) => a.album.toLocaleLowerCase().indexOf(filter) > -1);
}).toProperty(() => []);;


export {
  kArtists,
  kArtist,
  kAlbums,
  kAlbum,
  kTrackList,
  kTrackIndex,
  kTrack,
  kPlayerQueueGetter,

  setArtist,
  setAlbum,
  setTrackIndex,

  setArtistFilter,
  kArtistFilter,
  kFilteredArtists,
  setAlbumFilter,
  kAlbumFilter,
  kFilteredAlbums,
}
