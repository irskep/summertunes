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
  console.log(`${SERVER_URL}/files${encodedPath}`);
  return `${SERVER_URL}/files${encodedPath}`;
}


class WebPlayer {
  constructor() {
    this.player = new Gapless5('gapless-block');

    this.kPath = K.constant(null)

    this.kVolume = K.constant(1)

    this.kIsPlaying = K.constant(false)

    this.kPlaybackSeconds = K.constant(0)

    this.kPlayingTrack = K.constant(null)
  }

  sendAndObserve(propertyName) {
  }

  setIsPlaying(isPlaying) {
  }

  setVolume(volume) {
  }

  seek(seconds) {
  }

  goToBeginningOfTrack() {
  }

  playTrack(track) {
    const path = _path(track);
    this.player.removeAllTracks();
    if (!this.player.trk) {
      const items = [{}];
			items[0].file = path;
      this.player.trk = new Gapless5FileList(items, 0, false);
			this.player.addInitialTrack(this.player.trk.files()[0]);
    } else {
      this.player.addTrack(path);
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
  }
}

export default new WebPlayer();