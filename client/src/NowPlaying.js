import React, { PropTypes } from 'react';
import './css/NowPlaying.css';
import secondsToString from "./util/secondsToString";
import KComponent from "./KComponent";

import { seek, kPlayingTrack, kPlaybackSeconds, kAlbumArtURL } from "./model/mpvModel";
import { setArtist, setAlbum } from "./model/browsingModel";

function percentage(fraction) {
    return `${fraction * 100}%`;
}

class NowPlaying extends KComponent {
  observables() { return {
      track: kPlayingTrack,
      playbackSeconds: kPlaybackSeconds,
      albumArtURL: kAlbumArtURL,
  }; }

  seek(e) {
      const fraction = e.nativeEvent.offsetX / this.playbackSecondsBar.clientWidth;
      seek(this.state.track.length * fraction);
      e.stopPropagation();
  }

  render() {
    const playbackFraction = this.state.track
        ? this.state.playbackSeconds / this.state.track.length
        : 0;
    const albumArtURL = this.state.albumArtURL.small;
    return <div
        onClick={() => {
            if (!this.state.track) return;
            setArtist(this.state.track.albumartist);
            setAlbum(this.state.track.album);
        }}
        className={`st-now-playing ${this.state.className}`}>
      <div className={`st-album-art ${albumArtURL ? "" : "st-album-art-empty"}`}
          style={{backgroundImage: `url(${this.state.albumArtURL.small})`}} />
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
          <div className="st-playback-time-bar-graphic"
              ref={(el) => this.playbackSecondsBar = el}
              onClick={(e) => {this.seek(e)}} >
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