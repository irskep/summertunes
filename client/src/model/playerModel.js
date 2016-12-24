import K from "kefir";
import createBus from "./createBus";
import mpvPlayer from "./mpvPlayer";
import webPlayer from "./webPlayer";
import apiKeys from "../apiKeys";


let _PLAYER = null;
const [setPlayer, bPlayer] = createBus();
const kPlayer = bPlayer.toProperty(() => webPlayer);
kPlayer.onValue((p) => _PLAYER = p);


const forwardPlayerProperty = (key) => {
  return kPlayer
    .flatMapLatest((player) => {
      return player[key];
    })
    .toProperty(() => null);
};


const forwardPlayerMethod = (key) => {
  return (...args) => _PLAYER[key](...args);
};


const kVolume = forwardPlayerProperty('kVolume');
const kIsPlaying = forwardPlayerProperty('kIsPlaying');
const kPlaybackSeconds = forwardPlayerProperty('kPlaybackSeconds');
const kPlayingTrack = forwardPlayerProperty('kPlayingTrack');

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