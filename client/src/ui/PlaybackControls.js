import React from 'react';
import "../css/Toolbar.css";
import {
  kIsPlaying,
  kPlayingTrack,
  kPlaybackSeconds,
  setIsPlaying,
  goToBeginningOfTrack,
  goToNextTrack,
  goToPreviousTrack,
} from "../model/playerModel";
import KComponent from "../util/KComponent";
import { play, pause } from "../util/svgShapes";

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
    if (this.state.playbackSeconds < 2) {
      goToPreviousTrack();
    } else {
      goToBeginningOfTrack();
    }
  }

  render() {
    return (
        <div className="st-toolbar-button-group st-playback-controls">
          <div onClick={() => { this.goBack(); }}>{play(true, true)}</div>
          {this.state.isPlaying && <div onClick={this.pause}>{pause()}</div>}
          {!this.state.isPlaying && <div onClick={this.play}>{play(false, false)}</div>}
          <div onClick={goToNextTrack}>{play(true, false)}</div>
        </div>
    );
  }
}
