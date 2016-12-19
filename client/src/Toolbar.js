/* global window */
import React, { Component } from 'react';
import NowPlaying from "./NowPlaying";
import "./css/Toolbar.css";
import { SERVER_URL } from "./config";

class Toolbar extends Component {
  pause() {
      window.fetch(`${SERVER_URL}/stop`);
  }

  render() {
      return <div className="st-toolbar">
        <div className="st-toolbar-button-group st-playback-controls">
          <div>{"<"}</div>
          <div onClick={this.pause}>{"P"}</div>
          <div>{">"}</div>
        </div>
        <NowPlaying
            playbackState={{
              seconds: 146,
              isPlaying: true,
            }}
            track={{
              title: "To Let Myself Go",
              artist: "Ane Brun",
              album: "A Temporary Dive",
              duration: 195,
            }}/>
        <input className="st-mac-style-input st-search-box" placeholder="Search" />
      </div>;
  }
}

Toolbar.propTypes = {
};

Toolbar.defaultProps = {
};

export default Toolbar;