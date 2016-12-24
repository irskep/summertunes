/* global Gapless5 */
/* global Gapless5FileList */
import K from "kefir";
import createBus from "./createBus";
import { SERVER_URL } from "../config";


function _path(track) {
  const encodedPath = track.path
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `${SERVER_URL}/files${encodedPath}`;
}


class WebPlayer {
  constructor() {
    this.player = new Gapless5('gapless-block');
    window.player = this.player;

    const [setPlay, bPlay] = createBus();
    this.player.onplay = () => setPlay(true);
    this.player.onpause = () => setPlay(false);
    this.kIsPlaying = bPlay.toProperty(() => false);

    this.kPath = K.constant(null)

    this.kVolume = K.constant(1)

    this.kPlaybackSeconds = K.constant(0)

    this.kPlayingTrack = K.constant(null)
  }

  sendAndObserve(propertyName) {
  }

  setIsPlaying(isPlaying) {
    isPlaying ? this.player.pause() : this.player.play();
  }

  setVolume(volume) {
  }

  seek(seconds) {
  }

  goToBeginningOfTrack() {
  }

  playTrack(track) {
    const path = _path(track);
    this.player.pause();
    while (this.player.totalTracks() > 1) {
      this.player.removeTrack(0);
    }
    if (!this.player.trk) {
      const items = [{}];
			items[0].file = path;
      this.player.trk = new Gapless5FileList(items, 0, false);
			this.player.addInitialTrack(this.player.trk.files()[0]);
    } else {
      // Gapless5 can't handle empty playlists, LOLOL
      this.player.addTrack(path);
      this.player.gotoTrack(1);
    }
    this.player.play();
  }

  playTracks(tracks) {
    this.playTrack(tracks[0]);
    tracks.slice(1).forEach((track) => {
      this.player.addTrack(_path(track));
    });
  }

  goToNextTrack() {
    this.player.next();
  }
}

export default new WebPlayer();