/* global window */
import React, { Component } from 'react';
import NowPlaying from "./NowPlaying";
import "./css/Toolbar.css";
import { SERVER_URL } from "./config";
import {
  kIsPlaying,
  setIsPlaying,
  goToBeginningOfTrack,
} from "./model/mpvModel";
import K from "kefir";

class PlaybackControls extends Component {
  componentWillMount() {
    this.observable = K.combine([kIsPlaying]);
    this.subscriber = this.observable.onValue(([isPlaying]) => {
      this.setState({isPlaying});
    });
  }

  componentWillUnmount() {
      this.observable.offValue(this.subscriber);
  }

  play() {
    setIsPlaying(true);
  }

  pause() {
    setIsPlaying(false);
  }

  render() {
    return (
        <div className="st-toolbar-button-group st-playback-controls">
          <div onClick={goToBeginningOfTrack}>{"<"}</div>
          {this.state.isPlaying && <div onClick={this.pause}>❚❚</div>}
          {!this.state.isPlaying && <div onClick={this.play}>▶</div>}
          <div>{">"}</div>
        </div>
    );
  }
}

class Toolbar extends Component {
  pause() {
      window.fetch(`${SERVER_URL}/stop`);
  }

  render() {
      return <div className="st-toolbar">
        <PlaybackControls />
        <NowPlaying />
        <input className="st-mac-style-input st-search-box" placeholder="Search" />
      </div>;
  }
}

Toolbar.propTypes = {
};

Toolbar.defaultProps = {
};

export default Toolbar;