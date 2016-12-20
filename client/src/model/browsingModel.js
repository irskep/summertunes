import K from "kefir";
import { SERVER_URL } from "../config";
import createBus from "./createBus";
import trackQueryString from "./trackQueryString";
import localStorageJSON from "../util/localStorageJSON";


const kArtists = K.fromPromise(
    window.fetch(`${SERVER_URL}/artists`)
      .then((response) => response.json())
      .then(({artists}) => artists)
).toProperty(() => []);


const [setArtist, bArtist] = createBus()
const kArtist = bArtist.skipDuplicates().toProperty(() => localStorageJSON("browsingArtist", null));

const kAlbums = kArtist
  .flatMapLatest((artistName) => {
    const query = artistName
      ? `${SERVER_URL}/albums?albumartist=${artistName}`
      : `${SERVER_URL}/albums`;

    return K.fromPromise(
      window.fetch(query)
        .then((response) => response.json())
        .then(({albums}) => albums));
  })
  .merge(kArtist.map(() => []))
  .toProperty(() => [])

const [setAlbum, bAlbum] = createBus()
const kAlbum = bAlbum
  .merge(kArtist.map(() => null))
  .skipDuplicates()
  .toProperty(() => localStorageJSON("browsingAlbum", null));

const kTrackList = K.combine([kArtist, kAlbum])
  .flatMapLatest(([artist, album]) => {
    if (!artist && !album) return K.constant([])
    const url = `${SERVER_URL}/tracks?${trackQueryString({artist, album})}`;
    return K.fromPromise(
      window.fetch(url)
        .then((response) => response.json())
        .then(({tracks}) => tracks)
    );
  })
  .toProperty(() => []);

const [setTrackIndex, bTrackIndex] = createBus()
const kTrackIndex = bTrackIndex
  .merge(kTrackList.changes().map(() => null))
  .toProperty(() => null);

const kTrack = K.combine([kTrackList, kTrackIndex], (trackList, trackIndex) => {
  if (trackIndex === null) return null;
  if (trackList.length < 1) return null;
  if (trackIndex >= trackList.length) return null;
  return trackList[trackIndex];
}).toProperty(() => null);

const kPlayerQueueGetter = K.combine([kTrackList, kTrackIndex], (trackList, trackIndex) => {
  if (trackIndex === null) return null;
  if (trackList.length < 1) return null;
  if (trackIndex >= trackList.length) return null;
  return () => trackList.slice(trackIndex);
}).toProperty(() => () => []);

/* localStorage sync */

kArtist.onValue((artist) => localStorage.browsingArtist = JSON.stringify(artist))
kAlbum.onValue((album) => localStorage.browsingAlbum = JSON.stringify(album))


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