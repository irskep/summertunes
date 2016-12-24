/* global window */
import React from 'react';
import NowPlaying from "./NowPlaying";
import "./css/Toolbar.css";
import PlaybackControls from "./PlaybackControls";
import KComponent from "./KComponent";
import { kVolume, setVolume } from "./model/playerModel";

class Toolbar extends KComponent {
  observables() { return {
    volume: kVolume,
  }; }

  renderVolumeControl() {
    return <input
      type="range" min="0" max="1" step="0.01"
      onChange={(e) => setVolume(parseFloat(e.target.value))}
      value={this.state.volume} />;
  }

  renderNormal() {
    return <div className="st-toolbar">
      <PlaybackControls />
      <NowPlaying />
      {this.renderVolumeControl()}
    </div>;
  }

  renderStacked() {
      return <div className="st-toolbar st-toolbar-stacked">
        <NowPlaying />
        <div className="st-toolbar-stacked-horz-group">
          <PlaybackControls />
          {this.renderVolumeControl()}
        </div>
      </div>;
  }

  render() {
    return this.props.stacked ? this.renderStacked() : this.renderNormal();
  }
}

Toolbar.defaultProps = {
  stacked: false,
}

export default Toolbar;