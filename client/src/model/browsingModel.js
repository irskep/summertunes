import K from "kefir";
import { SERVER_URL } from "../config";
import createBus from "./createBus";
import trackQueryString from "./trackQueryString";
import localStorageJSON from "../util/localStorageJSON";


const keepAlive = (observable) => observable.onValue(() => { })


const kArtists = K.fromPromise(
    window.fetch(`${SERVER_URL}/artists`)
      .then((response) => response.json())
      .then(({artists}) => artists)
).toProperty(() => []);
keepAlive(kArtists);


const [setArtist, bArtist] = createBus()
const kArtist = bArtist
  .skipDuplicates()
  .toProperty(() => localStorageJSON("browsingArtist", null));
keepAlive(kArtist);

const kAlbums = kArtist
  .flatMapLatest((artistName) => {
    const query = artistName
      ? `${SERVER_URL}/albums?albumartist=${artistName}`
      : `${SERVER_URL}/albums`;

    return K.fromPromise(
      window.fetch(query)
        .then((response) => response.json())
        .then(({albums}) => albums)
    );
  })
  .toProperty(() => [])
keepAlive(kAlbums);

const [setAlbum, bAlbum] = createBus()
const kAlbum = bAlbum
  .merge(kArtist.map(() => null).skip(1))  // don't zap initial load
  .skipDuplicates()
  .toProperty(() => localStorageJSON("browsingAlbum", null));
keepAlive(kAlbum);

const kTrackList = K.combine([kArtist, kAlbum])
  .flatMapLatest(([artist, album]) => {
    if (!artist && !album) return K.constant([])
    const url = `${SERVER_URL}/tracks?${trackQueryString({artist, album})}`;
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

/* localStorage sync */

kArtist.onValue((artist) => localStorage.browsingArtist = JSON.stringify(artist));
kAlbum.onValue((album) => localStorage.browsingAlbum = JSON.stringify(album));


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
}
