import React, { Component, PropTypes } from 'react';
import './css/NowPlaying.css';
import secondsToString from "./secondsToString";

import {
    kTrack,
    kPlaybackSeconds,
} from "./mpv";
import K from "kefir";

function percentage(fraction) {
    return `${fraction * 100}%`;
}

class NowPlaying extends Component {
  componentWillMount() {
    this.observable = K.combine([kTrack, kPlaybackSeconds]);
    this.subscriber = this.observable.onValue(([track, playbackSeconds]) => {
      this.setState({track, playbackSeconds});
    });
  }

  componentWillUnmount() {
      this.observable.offValue(this.subscriber);
  }

  render() {
      const playbackFraction = this.state.track
        ? this.state.playbackSeconds / this.state.track.length
        : 0;
      return <div className={`st-now-playing ${this.state.className}`}>
        <div className="st-album-art" />
        {this.state.track && <div className="st-now-playing-title">
            <strong>{this.state.track.title}</strong>
            {" by "}
            <strong>{this.state.track.artist}</strong>
            {" from "}
            <strong>{this.state.track.album}</strong>
        </div>}
        {this.state.track && <div className="st-playback-time-bar">
            <div className="st-playback-time-bar-now">
                {secondsToString(this.state.playbackSeconds)}
            </div>    
            <div className="st-playback-time-bar-graphic">
                <div style={{width: percentage(playbackFraction)}} />
            </div>    
            <div className="st-playback-time-bar-duration">
                {secondsToString(this.state.track.length)}
            </div>    
        </div>}
      </div>;
  }
}

NowPlaying.propTypes = {
    className: PropTypes.string,
};

NowPlaying.defaultProps = {
    className: "",
};

export default NowPlaying;