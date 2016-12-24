import K from "kefir";
import createBus from "./createBus";
import mpvPlayer from "./mpvPlayer";
import webPlayer from "./webPlayer";
import apiKeys from "../apiKeys";
import { SERVER_URL } from "../config";


const keepAlive = (observable) => {
  observable.onValue(() => { });
  return observable;
}


const playersByName = {
  web: webPlayer,
  mpv: mpvPlayer,
}


let _PLAYER = null;
const [setPlayer, bPlayer] = createBus();
const kPlayer = bPlayer.toProperty(() => playersByName.web);
kPlayer.onValue((p) => _PLAYER = p);


const forwardPlayerProperty = (key) => {
  return keepAlive(kPlayer
    .flatMapLatest((player) => {
      return player[key];
    })
    .toProperty(() => null));
};


const forwardPlayerMethod = (key) => {
  return (...args) => _PLAYER[key](...args);
};


const kVolume = forwardPlayerProperty('kVolume');
const kIsPlaying = forwardPlayerProperty('kIsPlaying');
const kPlaybackSeconds = forwardPlayerProperty('kPlaybackSeconds');
const kPath = forwardPlayerProperty('kPath');

const kPlayingTrack = kPath
  .flatMapLatest((path) => {
    if (!path) return K.constant(null);
    return K.fromPromise(
      window.fetch(`${SERVER_URL}/track?path=${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then(({track}) => track)
    );
  })
  .toProperty(() => null);

const kLastFM = kPlayingTrack
  .flatMapLatest((track) => {
    if (!track) return K.constant(null);
    return K.fromPromise(window.fetch(
          `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${
            apiKeys.lastFM
          }&artist=${
            track.artist
          }&album=${
            track.album
          }&format=json`
      ).then((result) => result.json())
    );
  })
  .toProperty(() => null);

const kAlbumArtURL = kLastFM
  .map((lastFMData) => {
    if (!lastFMData || !lastFMData.album) return {};
    const urlBySize = {};
    for (const imgData of (lastFMData.album.image || [])) {
      urlBySize[imgData.size] = imgData["#text"];
    }
    return urlBySize;
  });
keepAlive(kAlbumArtURL);


const setIsPlaying = forwardPlayerMethod('setIsPlaying');
const setVolume = forwardPlayerMethod('setVolume');
const seek = forwardPlayerMethod('seek');
const goToBeginningOfTrack = forwardPlayerMethod('goToBeginningOfTrack');
const playTrack = forwardPlayerMethod('playTrack');
const playTracks = forwardPlayerMethod('playTracks');
const goToNextTrack = forwardPlayerMethod('goToNextTrack');


export {
  kPlayer,
  setPlayer,

  kVolume,
  kIsPlaying,
  kPlaybackSeconds,
  kPlayingTrack,
  kAlbumArtURL,

  setIsPlaying,
  setVolume,
  seek,
  goToBeginningOfTrack,
  playTrack,
  playTracks,
  goToNextTrack,
}