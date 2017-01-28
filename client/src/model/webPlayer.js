import K from "kefir";
import createBus from "./createBus";
import { kStaticFilesURL } from "../config";
import MusicPlayer from "../util/webAudioWrapper";


let URL_PREFIX = '';
// a little cheap but whatever
kStaticFilesURL.onValue((url) => URL_PREFIX = url);


const keepAlive = (observable) => {
  observable.onValue(() => { });
  return observable;
}


const createBusProperty = (initialValue, skipDuplicates = true) => {
  const [setter, bus] = createBus();
  const property = (skipDuplicates ? bus.skipDuplicates() : bus).toProperty(() => initialValue);
  return [setter, property];
}


const createCallbackStream = (obj, key) => {
  const [setter, bus] = createBus();
  obj[key] = setter;
  return bus;
}


function _pathToURL(track) {
  const encodedPath = track.path
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return URL_PREFIX + encodedPath;
}


function _urlToPath(url) {
  return url
    .slice(URL_PREFIX.length)
    .split('/')
    .map(decodeURIComponent)
    .join('/');
}


class WebPlayer {
  constructor() {
    this.player = new MusicPlayer();
    window.player = this.player;

    const kSongFinished = createCallbackStream(this.player, "onSongFinished");
    const kPlaylistEnded = createCallbackStream(this.player, "onPlaylistEnded");
    const kPlayerStopped = createCallbackStream(this.player, "onPlayerStopped");
    const kPlayerPaused = createCallbackStream(this.player, "onPlayerPaused");
    const kPlayerUnpaused = createCallbackStream(this.player, "onPlayerUnpaused");
    const kTrackLoaded = createCallbackStream(this.player, "onTrackLoaded");
    const kTrackAdded = createCallbackStream(this.player, "onTrackAdded");
    const kTrackRemoved = createCallbackStream(this.player, "onTrackRemoved");
    const kVolumeChanged = createCallbackStream(this.player, "onVolumeChanged");
    const kMuted = createCallbackStream(this.player, "onMuted");
    const kUnmuted = createCallbackStream(this.player, "onUnmuted");

    this.kIsPlaying = keepAlive(kPlayerStopped.map(() => false)
      .merge(kPlayerPaused.map(() => false))
       .merge(kPlayerUnpaused.map(() => true))
       .merge(kPlayerPaused.map(() => false))
       .toProperty(() => false));

    this.kVolume = keepAlive(kVolumeChanged.toProperty(() => 1));

    this.kPlaylistCount = keepAlive(K.constant(0)
      .merge(kTrackAdded)
      .merge(kTrackRemoved)
      .merge(kPlayerUnpaused)
      .merge(kPlayerStopped)
      .merge(kSongFinished)
      .map(() => this.player.playlist.length)
    .toProperty(() => 0));

    this.kPlaylistPaths = keepAlive(this.kPlaylistCount
      .map(() => this.player.playlist.map(({path}) => _urlToPath(path))));

    this.kPlaylistIndex = K.constant(0);  // web player keeps mutating its playlist

    const [observePath, kPath] = createBusProperty(null);
    this._observePath = observePath;
    this.kPath = kPath.skipDuplicates();

    kSongFinished.onValue(() => {
      this._updateTrack();
    })

    const [observePlaybackSeconds, kPlaybackSeconds] = createBusProperty(0);
    this.kPlaybackSeconds = kPlaybackSeconds;

    const updatePlaybackSeconds = () => {
      observePlaybackSeconds(this.player.getSongPosition());
      this._updateTrack();

      window.requestAnimationFrame(updatePlaybackSeconds);
    };
    window.requestAnimationFrame(updatePlaybackSeconds);
  }

  _updateTrack() {
    if (this.player.playlist.length) {
      this._observePath(_urlToPath(this.player.playlist[0].path));
    } else {
      this._observePath(null);
    }
  }

  setIsPlaying(isPlaying) {
    if (isPlaying) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }

  setVolume(volume) {
    this.player.setVolume(volume);
  }

  seek(seconds) {
    this.player.setSongPosition(seconds);
  }

  goToBeginningOfTrack() {
    this.player.setSongPosition(0);
  }

  playTrack(track) {
    this.player.pause();
    this.player.removeAllTracks();
    this.player.addTrack(_pathToURL(track), () => {
      this.player.play();
    });
  }

  enqueueTrack(track) {
    this.player.addTrack(_pathToURL(track));
  }

  playTracks(tracks) {
    this.playTrack(tracks[0]);
    for (const track of tracks.slice(1)) {
      this.player.addTrack(_pathToURL(track));
    }
  }

  enqueueTracks(tracks) {
    for (const track of tracks) {
      this.player.addTrack(_pathToURL(track));
    }
  }

  removeTrackAtIndex(i) {
    this.player.removeTrack(i);
  }

  goToNextTrack() {
    this.player.playNext();
  }

  goToPreviousTrack() {
    console.error("Not implemented; web player doesn't store history");
  }
  
  setPlaylistIndex(i) {
    for (let j = 0; j < i; j++) {
      this.player.removeTrack(0);
    }
  }

  refreshPlaylist() {
    // playlist is always refreshed
  }
}

export default new WebPlayer();
