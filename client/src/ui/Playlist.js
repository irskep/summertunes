import React from 'react';
import KComponent from "../util/KComponent";
import Table from "../uilib/Table";
import {
  refreshPlaylist,
  kPlaylistTracks,
  kPlaylistIndex,
  setPlaylistIndex,
} from "../model/playerModel";
import { setIsInfoModalOpen } from "../model/uiModel";
import { setInfoModalTrack } from "../model/browsingModel";
import { play } from "../util/svgShapes";
import secondsToString from "../util/secondsToString";

export default class Playlist extends KComponent {
  constructor() {
    super();
    this.state = {trackIndex: null};
  }

  observables() {
    return {
      tracks: kPlaylistTracks,
      playlistIndex: kPlaylistIndex,
    };
  }

  componentDidMount() {
    refreshPlaylist();
  }

  selectedTrack() {
    if (this.state.trackIndex === null) return null;
    if (!this.state.tracks || !this.state.tracks.length) return null;
    return this.state.tracks[this.state.trackIndex];
  }

  renderEmpty() {
    return (
      <div className="st-track-list-empty st-app-overflowing-section">
        <h1>No tracks in playlist</h1>
      </div>
    );
  }

  render() {
    if (!this.state.tracks || !this.state.tracks.length) return this.renderEmpty();
    return <Table className="st-track-list st-app-overflowing-section"

      onClick={(item, i) => {
        if (this.state.trackIndex === i) {
          setPlaylistIndex(i);
        } else {
          this.setState({trackIndex: i});
        }
      }}

      columns={[
        {name: '#', itemKey: 'func', func: (item, columnIndex, rowIndex) => {
          return <span>
            {rowIndex + 1}
            {rowIndex === this.state.playlistIndex && (
              <span className="st-playing-track-indicator">
                {play(false, false, 20, this.selectedTrack() === item ? "#fff" : "#666")}
              </span>
            )}
          </span>;
        }},
        {name: 'Title', itemKey: 'func', func: (item, i) => {
          return <div>
            {item.title}
            <span className="st-track-overflow-button" onClick={() => {
              setInfoModalTrack(item);
              setIsInfoModalOpen(true);
            }}>v</span>
          </div>
        }},
        {name: 'Album Artist', itemKey: 'albumartist'},
        {name: 'Album', itemKey: 'album'},
        {name: 'Year', itemKey: 'year'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
      ]}

      renderGroupHeader={(itemsInGroup, key) => null}

      selectedItem={this.state.trackIndex === null ? null : this.selectedTrack()}
      items={this.state.tracks} />;
  }
};
