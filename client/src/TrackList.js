/* global window */
import React from 'react';
import Table from "./Table";
import KComponent from "./KComponent"
import secondsToString from "./util/secondsToString";

import { playTrack, kPlayingTrack } from "./model/mpvModel";
import { kTrackList, kTrackIndex, setTrackIndex } from "./model/browsingModel";

function areTracksEqual(a, b) {
  if (Boolean(a) !== Boolean(b)) return false;
  return a.id === b.id;
}

class TrackList extends KComponent {
  observables() { return {
    tracks: kTrackList,
    trackIndex: kTrackIndex,
    playingTrack: kPlayingTrack,
  }; }

  render() {
    return <Table className="st-track-list"
      onClick={(item, i) => {
        const track = this.state.tracks[this.state.trackIndex]
        if (i === this.state.trackIndex && !areTracksEqual(track, this.state.playingTrack)) {
          playTrack(track);
        } else {
          setTrackIndex(i);
        }
      }}
      selectedItem={this.state.trackIndex === null ? null : this.state.tracks[this.state.trackIndex]}
      columns={[
        {name: 'Track Number', itemKey: 'track'},
        {name: 'Title', itemKey: 'title'},
        {name: 'Album Artist', itemKey: 'albumartist'},
        {name: 'Album', itemKey: 'album'},
        {name: 'Year', itemKey: 'year'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
        {name: 'Disc Number', itemKey: 'disc'},
      ]}
      items={this.state.tracks} />;
  }
}

export default TrackList;