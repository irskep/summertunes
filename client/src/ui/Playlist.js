import React from 'react';
import KComponent from "../util/KComponent";
import { refreshPlaylist, kPlaylistTracks } from "../model/playerModel";

export default class Playlist extends KComponent {
  observables() {
    return {
      tracks: kPlaylistTracks,
    };
  }

  componentDidMount() {
    refreshPlaylist();
  }

  render() {
    return (
      <div>
        {this.state.tracks.map((track, i) => {
          if (!track) return <div key={i}>"..."</div>;
          return <div key={i}>{track.title}</div>;
        })}
      </div>
    );
  }
};
