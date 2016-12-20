/* global window */
import React, { Component } from 'react';
import NowPlaying from "./NowPlaying";
import "./css/Toolbar.css";
import PlaybackControls from "./PlaybackControls";

class Toolbar extends Component {
  renderNormal() {
      return <div className="st-toolbar">
        <PlaybackControls />
        <NowPlaying />
        <input className="st-mac-style-input st-search-box" placeholder="Search" />
      </div>;
  }

  renderStacked() {
      return <div className="st-toolbar st-toolbar-stacked">
        <NowPlaying />
        <PlaybackControls />
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