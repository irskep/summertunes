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

    const track = this.state.track || {
        album: "ALBUM",
        artist: "ARTIST",
        title: "TITLE",
        length: 100,
    };

    return <div
        onClick={() => {
            if (!track) return;
            setArtist(track.albumartist);
            setAlbum(track.album);
        }}
        className={`st-now-playing ${this.state.className}`}>
      <div className={`st-album-art ${albumArtURL ? "" : "st-album-art-empty"}`}
          style={{backgroundImage: `url(${this.state.albumArtURL.small})`}} />
      {track && <div className="st-now-playing-title">
          <strong>{track.title}</strong>
          {" by "}
          <strong>{track.artist}</strong>
          {" from "}
          <strong>{track.album}</strong>
      </div>}
      {track && <div className="st-playback-time-bar">
          <div className="st-playback-time-bar-now">
              {secondsToString(this.state.playbackSeconds)}
          </div>    
          <div className="st-playback-time-bar-graphic"
              ref={(el) => this.playbackSecondsBar = el}
              onClick={(e) => {this.seek(e)}} >
              <div style={{width: percentage(playbackFraction)}} />
          </div>    
          <div className="st-playback-time-bar-duration">
              {secondsToString(track.length)}
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