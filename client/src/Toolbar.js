import React, { Component } from 'react';
import NowPlaying from "./NowPlaying";
import "./Toolbar.css";

class Toolbar extends Component {
  render() {
      return <div className="st-toolbar">
        <div className="st-toolbar-button-group st-playback-controls">
          <div>{"<"}</div>
          <div>{"P"}</div>
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