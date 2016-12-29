import createBus from "./createBus";
import { SERVER_URL } from "../config";
import MusicPlayer from "../util/webAudioWrapper";


const URL_PREFIX = `${SERVER_URL}/files`


const createBusProperty = (initialValue) => {
  const [setter, bus] = createBus();
  const property = bus.toProperty(() => initialValue);
  return [setter, property];
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

    this.secretPlaylist = [];

    const [observeIsPlaying, kIsPlaying] = createBusProperty(false);

    this.kIsPlaying = kIsPlaying;
    this.player.onPlayerUnpaused = () => {
      observeIsPlaying(true);
      this._updateTrack();
    }
    this.player.onPlayerPaused = () => {
      observeIsPlaying(false);
      this._updateTrack();
    }

    const [observeVolume, kVolume] = createBusProperty(1);
    this.player.onVolumeChanged = observeVolume;
    this.kVolume = kVolume;

    const [observePath, kPath] = createBusProperty(null);
    this._observePath = observePath;
    this.kPath = kPath.skipDuplicates();

    this.player.onSongFinished = () => this._updateTrack();

    const [observePlaybackSeconds, kPlaybackSeconds] = createBusProperty(0);
    this.kPlaybackSeconds = kPlaybackSeconds;

    const updatePlaybackSeconds = () => {
      observePlaybackSeconds(this.player.getSongPosition());
      observeIsPlaying(
        this.player.playlist.length > 0 &&
        !this.player.playlist[0].paused)
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
    this.fillWebAudioQueue();
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

  playTracks(tracks) {
    this.playTrack(tracks[0]);
    this.secretPlaylist = tracks.slice(1);
    this.fillWebAudioQueue();
  }

  goToNextTrack() {
    this.player.playNext();
  }

  fillWebAudioQueue() {
    while (this.player.playlist.length < 2 && this.secretPlaylist.length) {
      this.player.addTrack(_pathToURL(this.secretPlaylist[0]));
      this.secretPlaylist.shift();
    }
  }
}

export default new WebPlayer();