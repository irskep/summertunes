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

  renderTriangle(post, flip) {
    const twoPi = Math.PI  * 2;
    const angles = [0, twoPi / 3, twoPi / 3 * 2];
    const numbers = [];
    const size = 22;
    const radius = size * 0.3;
    const xOffset = -2;

    const transform = flip ? "scale(-1, 1)" : "";

    for (const angle of angles) {
      numbers.push(
        Math.cos(angle) * radius + xOffset,
        Math.sin(angle) * radius);
    }
    const [x1, y1, x2, y2, x3, y3] = numbers;  // eslint-disable-line no-unused-vars
    return (
      <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g transform={`translate(${size/2}, ${size/2}) ${transform}`}>
          <polygon points={numbers.join(' ')} fill="#666" strokeWidth="0"/>
          {post && <line x1={x1 + 1} y1={y2} x2={x1 + 1} y2={y3} strokeWidth="1" stroke="#666" />}
        </g>
      </svg>
    );
  }

  renderPause() {
    const size = 22;
    const w = size * 0.2;
    const h = size * 0.5;

    return (
      <svg width={size} height={size} version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g transform={`translate(${size/2}, ${size/2})`}>
          <rect x={-w - 2} y={-h / 2} width={w} height={h} fill="#666" strokeWidth="0"/>
          <rect x={2} y={-h / 2} width={w} height={h} fill="#666" strokeWidth="0"/>
        </g>
      </svg>
    );
  }

  render() {
    return (
        <div className="st-toolbar-button-group st-playback-controls">
          <div onClick={this.goBack}>{this.renderTriangle(true, true)}</div>
          {this.state.isPlaying && <div onClick={this.pause}>{this.renderPause()}</div>}
          {!this.state.isPlaying && <div onClick={this.play}>{this.renderTriangle(false, false)}</div>}
          <div onClick={goToNextTrack}>{this.renderTriangle(true, false)}</div>
        </div>
    );
  }
}
