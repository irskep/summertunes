import K from "kefir";
import { SERVER_URL } from "../config";
import createBus from "./createBus";


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

const [setTrack, bTrack] = createBus()
const kTrack = bTrack.toProperty(() => null);


export {
  kArtists,
  kArtist,
  kAlbums,
  kAlbum,
  kTrack,

  setArtist,
  setAlbum,
  setTrack,
}