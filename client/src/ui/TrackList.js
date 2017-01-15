/* global window */
import React from 'react';
import Table from "../uilib/Table";
import KComponent from "../util/KComponent"
import secondsToString from "../util/secondsToString";
import { play } from "../util/svgShapes";
import "../css/TrackList.css";

import { kIsSmallUI, kUIConfigSetter, setIsInfoModalOpen } from "../model/uiModel";
import { playTracks, kPlayingTrack } from "../model/playerModel";
import { kTrackList, kTrackIndex, kPlayerQueueGetter, setTrackIndex } from "../model/browsingModel";

function areTracksEqual(a, b) {
  if (Boolean(a) !== Boolean(b)) return false;
  return a.id === b.id;
}

class TrackList extends KComponent {
  observables() { return {
    tracks: kTrackList,
    trackIndex: kTrackIndex,
    playingTrack: kPlayingTrack,
    playerQueueGetter: kPlayerQueueGetter,
    isSmallUI: kIsSmallUI,
    uiConfigSetter: kUIConfigSetter,
  }; }

  selectedTrack() {
    if (this.state.trackIndex === null) return null;
    if (!this.state.tracks || !this.state.tracks.length) return null;
    return this.state.tracks[this.state.trackIndex];
  }

  renderEmpty() {
    return (
      <div className="st-track-list st-track-list-empty st-app-overflowing-section">
        <h1>No tracks selected</h1>
        <h2>You must select at least one artist or album.</h2>
        {this.state.isSmallUI && (
          <div>
            <div onClick={() => this.props.uiConfigSetter('Artist')}>Pick artist</div>
            <div onClick={() => this.props.uiConfigSetter('Album')}>Pick album</div>
          </div>
        )}
      </div>
    );
  }

  render() {
    if (!this.state.tracks || !this.state.tracks.length) return this.renderEmpty();
    return <Table className="st-track-list st-app-overflowing-section"

      onClick={(item, i) => {
        const track = this.state.tracks[this.state.trackIndex]
        if (i === this.state.trackIndex && !areTracksEqual(track, this.state.playingTrack)) {
          playTracks(this.state.playerQueueGetter());
        } else {
          setTrackIndex(i);
        }
      }}

      columns={[
        {name: '#', itemKey: 'func', func: (item) => {
          return <span>
            {item.disc}-{item.track}
            {this.state.playingTrack && item.id === this.state.playingTrack.id && (
              <span className="st-playing-track-indicator">
                {play(false, false, 20, this.selectedTrack() === item ? "#fff" : "#666")}
              </span>
            )}
          </span>;
        }},
        {name: 'Title', itemKey: 'func', func: ({title}, i) => {
          return <div>
            {title}
            <span className="st-track-overflow-button" onClick={() => {
              setTrackIndex(i);
              setIsInfoModalOpen(true);
            }}>v</span>
          </div>
        }},
        /*
        {name: 'Album Artist', itemKey: 'albumartist', groupSplitter: true},
        {name: 'Album', itemKey: 'album', groupSplitter: true},
        */
        {name: 'album_id', itemKey: 'album_id', groupSplitter: true},
        {name: 'Year', itemKey: 'year'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
      ]}

      renderGroupHeader={(itemsInGroup, key) => {
        const firstItem = itemsInGroup[0];
        return <tr className="st-track-list-header" key={key}>
          <td colSpan="4">
            <div className="st-track-list-header-album">{firstItem.album}</div>
            <div className="st-track-list-header-artist">{firstItem.albumartist}</div>
            <div className="st-track-list-header-year">{firstItem.year}</div>
          </td>
        </tr>;
      }}

      selectedItem={this.state.trackIndex === null ? null : this.selectedTrack()}
      items={this.state.tracks} />;
  }
}

export default TrackList;
