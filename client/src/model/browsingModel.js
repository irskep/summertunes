import K from "kefir";
import { kHTTBeetsURL } from "../config";
import createBus from "./createBus";
import trackQueryString from "./trackQueryString";
import parseURLQuery from "../util/parseURLQuery";
import makeURLQuery from "../util/makeURLQuery";

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

const withURLChange = (k, func) => (arg) => {
  func(arg);
  const newURLData = {
    ...latestURLData,
    [k]: arg,
  }
  history.pushState(null, "", makeURLQuery(newURLData));
  updateTitle(newURLData);
  sendStatePushed();
}

/* data */

const kArtists = kHTTBeetsURL
  .flatMapLatest((url) => {
    return K.fromPromise(
        window.fetch(`${url}/artists`)
          .then((response) => response.json())
          .then(({artists}) => artists))
  })
  .toProperty(() => []);
keepAlive(kArtists);


const [setArtistRaw, bArtist] = createBus()
const setArtist = withURLChange('artist', setArtistRaw);
const kArtist = bArtist
  .merge(urlDataChanges.map(keyMapper('artist')))
  .skipDuplicates()
  .toProperty(() => getURLData()['artist'])
keepAlive(kArtist);

const kAlbums = K.combine([kHTTBeetsURL, kArtist])
  .flatMapLatest(([url, artistName]) => {
    const query = artistName
      ? `${url}/albums?albumartist=${encodeURIComponent(artistName)}`
      : `${url}/albums`;

    return K.fromPromise(
      window.fetch(query)
        .then((response) => response.json())
        .then(({albums}) => albums)
    );
  })
  .toProperty(() => []);
keepAlive(kAlbums);

const [setAlbumRaw, bAlbum] = createBus()
const setAlbum = withURLChange('album', setAlbumRaw);
const kAlbum = bAlbum
  .merge(kArtist.map(() => null).skip(1))  // don't zap initial load
  .merge(urlDataChanges.map(keyMapper('album')))
  .skipDuplicates()
  .toProperty(() => getURLData()['album'])
keepAlive(kAlbum);

const kTrackList = K.combine([kHTTBeetsURL, kArtist, kAlbum])
  .flatMapLatest(([serverURL, artist, album]) => {
    if (!artist && !album) return K.constant([])
    const url = `${serverURL}/tracks?${trackQueryString({artist, album})}`;
    return K.fromPromise(
      window.fetch(url)
        .then((response) => response.json())
        // API does a substring match but we want exact.
        .then(({tracks}) => tracks.filter((track) => album === null || track.album === album))
    );
  })
  .toProperty(() => []);
keepAlive(kTrackList);

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
  if (trackIndex === null) return null;
  if (trackList.length < 1) return null;
  if (trackIndex >= trackList.length) return null;
  return () => trackList.slice(trackIndex);
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
