import K from "kefir";
import createBus from "./createBus";
import mpvPlayer from "./mpvPlayer";
import webPlayer from "./webPlayer";
import { kBeetsWebURL, kLastFMAPIKey, kPlayerServices, kStaticFilesURL } from "../config";
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



let _PLAYER = null;
const [setPlayerName, bPlayerName] = createBus();
const kPlayerName = K.combine([bPlayerName, kPlayerServices], (name, services) => {
  if (services.indexOf(name) > -1) return name;
  return 'web';
}).skipDuplicates().toProperty(() => localStorageJSON("playerName", "mpv"))
kPlayerName.onValue((playerName) => localStorage.playerName = JSON.stringify(playerName));
const kPlayer = kPlayerName.map((name) => playersByName[name])
kPlayer.onValue((p) => _PLAYER = p);


const forwardPlayerProperty = (key) => {
  return keepAlive(kPlayer
    .flatMapLatest((player) => {
      if (!_PLAYER) return K.constant(null); // player not yet initialized
      if (!_PLAYER[key]) {
        console.error("Player is missing property", key);
        return K.constant(null);
      }
      return player[key];
    })
    .toProperty(() => null));
};


const forwardPlayerMethod = (key) => {
  if (!_PLAYER) return; // player not yet initialized
  if (!_PLAYER[key]) console.error("Player is missing method", key);
  return (...args) => _PLAYER[key](...args);
};


const trackInfoKCache = {};


const createURLToKTrack = (url, path) => {
  if (trackInfoKCache[path]) return trackInfoKCache[path];
  if (!path) return K.constant(null);

  const property = K.fromPromise(
    window.fetch(`${url}/item/path/${encodeURIComponent(path)}`)
      .then((response) => response.json())
  ).toProperty(() => null);
  trackInfoKCache[path] = property;
  return property;
}


const createKPathToTrack = (kPathProperty) => {
  return K.combine([kBeetsWebURL, kPathProperty])
    .flatMapLatest(([url, path]) => {
      return createURLToKTrack(url, path);
    }).toProperty(() => null);
};


const kVolume = forwardPlayerProperty('kVolume');
const kIsPlaying = forwardPlayerProperty('kIsPlaying');
const kPlaybackSeconds = forwardPlayerProperty('kPlaybackSeconds');
const kPath = forwardPlayerProperty('kPath');
const kPlaylistCount = forwardPlayerProperty('kPlaylistCount');
const kPlaylistIndex = forwardPlayerProperty('kPlaylistIndex');
const kPlaylistPaths = forwardPlayerProperty('kPlaylistPaths');

const kPlayingTrack = createKPathToTrack(kPath);

const kPlaylistTracks = keepAlive(
  K.combine([kBeetsWebURL, kPlaylistPaths])
    .flatMapLatest(([url, paths]) => {
      if (!paths) return K.once([]);
      return K.combine(paths.map(createURLToKTrack.bind(this, url)));
    })
    .toProperty(() => []));


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

const kAlbumArtURL = K.combine([kBeetsWebURL, kPlayingTrack])
  .map(([url, track]) => {
    if (!url || !track) return {};
    return {small: `${url}/summertunes/track/art/${encodeURIComponent(track.path)}`};
  });
keepAlive(kAlbumArtURL);


/*
const kLastFMAlbumArtURL = kLastFM
  .map((lastFMData) => {
    if (!lastFMData || !lastFMData.album) return {};
    const urlBySize = {};
    for (const imgData of (lastFMData.album.image || [])) {
      urlBySize[imgData.size] = imgData["#text"];
    }
    return urlBySize;
keepAlive(kAlbumArtURL);
*/


const setIsPlaying = forwardPlayerMethod('setIsPlaying');
const setVolume = forwardPlayerMethod('setVolume');
const seek = forwardPlayerMethod('seek');
const goToBeginningOfTrack = forwardPlayerMethod('goToBeginningOfTrack');
const playTrack = forwardPlayerMethod('playTrack');
const enqueueTrack = forwardPlayerMethod('enqueueTrack');
const removeTrackAtIndex = forwardPlayerMethod('removeTrackAtIndex');
const playTracks = forwardPlayerMethod('playTracks');
const enqueueTracks = forwardPlayerMethod('enqueueTracks');
const goToNextTrack = forwardPlayerMethod('goToNextTrack');
const goToPreviousTrack = forwardPlayerMethod('goToPreviousTrack');
const refreshPlaylist = forwardPlayerMethod('refreshPlaylist');
const setPlaylistIndex = forwardPlayerMethod('setPlaylistIndex');


kIsPlaying.sampledBy(kSpaces).onValue((wasPlaying) => setIsPlaying(!wasPlaying));
kPlayingTrack.onValue(refreshPlaylist);


export {
  kPlayer,
  kPlayerName,
  setPlayerName,

  kVolume,
  kIsPlaying,
  kPlaybackSeconds,
  kPlayingTrack,
  kAlbumArtURL,

  kPlaylistCount,
  kPlaylistIndex,
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
  setPlaylistIndex,
  removeTrackAtIndex,
}
