import React, { Component, PropTypes } from 'react';
import './css/NowPlaying.css';
import secondsToString from "./secondsToString";

function percentage(fraction) {
    return `${fraction * 100}%`;
}

class NowPlaying extends Component {
  render() {
      const playbackFraction = this.props.track
        ? this.props.playbackState.seconds / this.props.track.duration
        : 0;
      return <div className={`st-now-playing ${this.props.className}`}>
        <div className="st-album-art" />
        {this.props.track && <div className="st-now-playing-title">
            <strong>{this.props.track.title}</strong>
            {" by "}
            <strong>{this.props.track.artist}</strong>
            {" from "}
            <strong>{this.props.track.album}</strong>
        </div>}
        {this.props.track && <div className="st-playback-time-bar">
            <div className="st-playback-time-bar-now">
                {secondsToString(this.props.playbackState.seconds)}
            </div>    
            <div className="st-playback-time-bar-graphic">
                <div style={{width: percentage(playbackFraction)}} />
            </div>    
            <div className="st-playback-time-bar-duration">
                {secondsToString(this.props.track.duration)}
            </div>    
        </div>}
      </div>;
  }
}

NowPlaying.propTypes = {
    className: PropTypes.string,
    track: PropTypes.object,
    playbackState: PropTypes.object,
};

NowPlaying.defaultProps = {
    className: "",
    track: null,
    playbackState: null,
};

export default NowPlaying;