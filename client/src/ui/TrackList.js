/* global window */
import "../css/TrackList.css";
import React, { Component } from 'react';
import Table                from "../uilib/Table";
import KComponent           from "../util/KComponent"
import secondsToString      from "../util/secondsToString";
import { play }             from "../util/svgShapes";

import {
  kIsSmallUI,
  kUIConfigSetter,
  openInfoModal,
}                           from "../model/uiModel";
import {
  playTracks,
  enqueueTrack,
  enqueueTracks,
  kPlayingTrack,
}                           from "../model/playerModel";
import {
  kTrackList,
  kTrackIndex,
  kPlayerQueueGetter,
  setTrackIndex,
}                           from "../model/browsingModel";

function areTracksEqual(a, b) {
  if (Boolean(a) !== Boolean(b)) return false;
  return a.id === b.id;
}

class TrackListOverflowButton extends Component {
  constructor() {
    super();
    this.state = { isOpen: false };
  }

  render() {
    return (
      <span
          className="st-track-overflow-button"
          onClick={() => this.setState({isOpen: !this.state.isOpen})}
          onMouseLeave={() => null}>
        v
        {this.state.isOpen && (
          <div className="st-track-overflow-menu">
            <div onClick={() => { openInfoModal(this.props.item); }}>
              info
            </div>
            <div onClick={() => { playTracks(this.props.playerQueueGetter(this.props.i)); }}>
              play now
            </div>
            <div onClick={() => { enqueueTrack(this.props.item); }}>
              enqueue
            </div>
          </div>
        )}
       </span>
    );

  }
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
          <div className="st-pick-artist-album-prompt">
            <div onClick={() => this.state.uiConfigSetter('Artist')}>Pick artist</div>
            <div onClick={() => this.state.uiConfigSetter('Album')}>Pick album</div>
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
        {name: 'Title', itemKey: 'func', func: (item, i) => {
          return <div>
            {item.title}
            <TrackListOverflowButton
              item={item}
              i={i}
              playerQueueGetter={this.state.playerQueueGetter} />
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
