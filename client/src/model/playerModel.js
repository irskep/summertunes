import K from "kefir";
import createBus from "./createBus";
import mpvPlayer from "./mpvPlayer";
import webPlayer from "./webPlayer";
import { kBeetsWebURL, kLastFMAPIKey } from "../config";
import localStorageJSON from "../util/localStorageJSON";
import { kSpaces } from "../model/keyboardModel";


const keepAlive = (observable) => {
  observable.onValue(() => { });
  return observable;
}


const playersByName = {
  web: webPlayer,
  mpv: mpvPlayer,
}
const playerNames = Object.keys(playersByName);


let _PLAYER = null;
const [setPlayerName, bPlayerName] = createBus();
const kPlayerName = bPlayerName
  .skipDuplicates()
  .toProperty(() => localStorageJSON("playerName", "mpv"));
kPlayerName.onValue((playerName) => localStorage.playerName = JSON.stringify(playerName));
const kPlayer = kPlayerName.map((name) => playersByName[name])
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


const trackInfoCache = {};


const createKPathToTrack = (kPathProperty) => K.combine([kBeetsWebURL, kPathProperty])
  .flatMapLatest(([url, path]) => {
    if (!path) return K.constant(null);
    if (trackInfoCache[path]) return K.constant(trackInfoCache[path]);
    return K.fromPromise(
      window.fetch(`${url}/item/path/${encodeURIComponent(path)}`)
        .then((response) => response.json())
        .then((json) => {
          trackInfoCache[path] = json;
          return trackInfoCache[path];
        })
    );
  })
  .toProperty(() => null);


const kVolume = forwardPlayerProperty('kVolume');
const kIsPlaying = forwardPlayerProperty('kIsPlaying');
const kPlaybackSeconds = forwardPlayerProperty('kPlaybackSeconds');
const kPath = forwardPlayerProperty('kPath');
const kPlaylistCount = forwardPlayerProperty('kPlaylistCount');
const kPlaylistPaths = forwardPlayerProperty('kPlaylistPaths');

const kPlayingTrack = createKPathToTrack(kPath);

const kPlaylistTracks = keepAlive(kPlaylistPaths
    .flatMapLatest((paths) => {
      return K.combine(paths.map((path) => createKPathToTrack(K.constant(path))));
    })
  ).toProperty(() => []);


const kLastFM = K.combine([kPlayingTrack, kLastFMAPIKey])
  .flatMapLatest(([track, lastFMAPIKey]) => {
    if (!track || !lastFMAPIKey) return K.constant(null);
    return K.fromPromise(window.fetch(
          `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${
            lastFMAPIKey
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
const enqueueTrack = forwardPlayerMethod('enqueueTrack');
const playTracks = forwardPlayerMethod('playTracks');
const enqueueTracks = forwardPlayerMethod('enqueueTracks');
const goToNextTrack = forwardPlayerMethod('goToNextTrack');
const goToPreviousTrack = forwardPlayerMethod('goToPreviousTrack');
const refreshPlaylist = forwardPlayerMethod('refreshPlaylist');


kIsPlaying.sampledBy(kSpaces).onValue((wasPlaying) => setIsPlaying(!wasPlaying));


export {
  kPlayer,
  kPlayerName,
  setPlayerName,
  playerNames,

  kVolume,
  kIsPlaying,
  kPlaybackSeconds,
  kPlayingTrack,
  kAlbumArtURL,

  kPlaylistCount,
  kPlaylistTracks,

  setIsPlaying,
  setVolume,
  seek,
  goToBeginningOfTrack,
  playTrack,
  playTracks,
  enqueueTrack,
  enqueueTracks,
  goToNextTrack,
  goToPreviousTrack,
  refreshPlaylist,
}
