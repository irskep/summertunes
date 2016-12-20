/* global window */
import React, { Component } from 'react';
import NowPlaying from "./NowPlaying";
import "./css/Toolbar.css";
import PlaybackControls from "./PlaybackControls";

class Toolbar extends Component {
  render() {
      return <div className="st-toolbar">
        <PlaybackControls />
        <NowPlaying />
        <input className="st-mac-style-input st-search-box" placeholder="Search" />
      </div>;
  }
}

export default Toolbar;