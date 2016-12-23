import React from 'react';
import "./css/Toolbar.css";
import {
  kIsPlaying,
  kPlayingTrack,
  kPlaybackSeconds,
  setIsPlaying,
  goToBeginningOfTrack,
  goToNextTrack,
} from "./model/mpvModel";
import KComponent from "./KComponent";
import { play, pause } from "./util/svgShapes";

export default class PlaybackControls extends KComponent {
  observables() { return {
    isPlaying: kIsPlaying,
    track: kPlayingTrack,
    playbackSeconds: kPlaybackSeconds,
  }; }

  play() {
    setIsPlaying(true);
  }

  pause() {
    setIsPlaying(false);
  }

  goBack() {
    // In the future, we'll reset the playback queue based on trackList + trackIndex - 1.
    goToBeginningOfTrack();
  }

  render() {
    return (
        <div className="st-toolbar-button-group st-playback-controls">
          <div onClick={this.goBack}>{play(true, true)}</div>
          {this.state.isPlaying && <div onClick={this.pause}>{pause()}</div>}
          {!this.state.isPlaying && <div onClick={this.play}>{play(false, false)}</div>}
          <div onClick={goToNextTrack}>{play(true, false)}</div>
        </div>
    );
  }
}
