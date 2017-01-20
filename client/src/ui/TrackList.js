/* global window */
import "../css/TrackList.css";
import React, { Component } from 'react';
import Table                from "../uilib/Table";
import KComponent           from "../util/KComponent"
import secondsToString      from "../util/secondsToString";
import { play }             from "../util/svgShapes";
import { ContextMenuTrigger } from "react-contextmenu";
import {
  kKeyboardFocus,
  keyboardFocusOptions,
}                           from "../model/keyboardModel";

import {
  kIsSmallUI,
  kUIConfigSetter,
}                           from "../model/uiModel";
import {
  playTracks,
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

function collectTrack(props) {
  return {
    item: props.item,
    i: props.i,
    playerQueueGetter: props.playerQueueGetter,
  };
}

class TrackListOverflowButton extends Component {
  constructor() {
    super();
    this.state = { isOpen: false };
  }

  render() {
    return (
      <ContextMenuTrigger
          id="trackList"
          holdToDisplay={0}
          {...this.props}
          collect={collectTrack}>
        <span
            className="st-track-overflow-button"
            onClick={() => this.setState({isOpen: !this.state.isOpen})}
            onMouseLeave={() => null}>
          v
        </span>
      </ContextMenuTrigger>
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
    isKeyboardFocused: kKeyboardFocus.map((id) => id === keyboardFocusOptions.trackList),
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

    const className = "st-track-list st-app-overflowing-section " + (
      this.state.isKeyboardFocused ? "st-keyboard-focus" : "");

    return <Table className={className}

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

      rowFactory={(item, i, trProps, children) => (
        <ContextMenuTrigger
            key={i}
            id="trackList"
            holdToDisplay={1000}
            attributes={trProps}
            renderTag="tr"
            item={item}
            i={i}
            playerQueueGetter={this.state.playerQueueGetter}
            collect={collectTrack}>
          {children}
        </ContextMenuTrigger>
      )}

      isKeyboardFocused={this.state.isKeyboardFocused}
      selectedItem={this.state.trackIndex === null ? null : this.selectedTrack()}
      items={this.state.tracks} />;
  }
}

export default TrackList;
