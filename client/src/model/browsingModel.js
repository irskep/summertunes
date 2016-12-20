import K from "kefir";
import { SERVER_URL } from "../config";
import createBus from "./createBus";
import trackQueryString from "./trackQueryString";


const kArtists = K.fromPromise(
    window.fetch(`${SERVER_URL}/artists`)
      .then((response) => response.json())
      .then(({artists}) => artists)
).toProperty(() => []);


const [setArtist, bArtist] = createBus()
const kArtist = bArtist.toProperty(() => null);

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
const kAlbum = bAlbum.toProperty(() => null);

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

const [setTrackIndex, bTrackIndex] = createBus()
const kTrackIndex = bTrackIndex
  .merge(kTrackList.changes().map(() => null))
  .toProperty(() => null);


export {
  kArtists,
  kArtist,
  kAlbums,
  kAlbum,
  kTrackList,
  kTrackIndex,

  setArtist,
  setAlbum,
  setTrackIndex,
}