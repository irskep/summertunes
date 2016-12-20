/* global window */
import React from 'react';
import Table from "./Table";
import KComponent from "./KComponent"
import secondsToString from "./util/secondsToString";

import { playTracks, kPlayingTrack } from "./model/mpvModel";
import { kTrackList, kTrackIndex, kPlayerQueueGetter, setTrackIndex } from "./model/browsingModel";

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
  }; }

  render() {
    return <Table className="st-track-list"
      onClick={(item, i) => {
        const track = this.state.tracks[this.state.trackIndex]
        if (i === this.state.trackIndex && !areTracksEqual(track, this.state.playingTrack)) {
          playTracks(this.state.playerQueueGetter());
        } else {
          setTrackIndex(i);
        }
      }}
      selectedItem={this.state.trackIndex === null ? null : this.state.tracks[this.state.trackIndex]}
      columns={[
        {name: 'Track #', itemKey: 'func', func: (item) => `${item.disc}-${item.track}`},
        {name: 'Title', itemKey: 'title'},
        {name: 'Album Artist', itemKey: 'albumartist'},
        {name: 'Album', itemKey: 'album'},
        {name: 'Year', itemKey: 'year'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
      ]}
      items={this.state.tracks} />;
  }
}

export default TrackList;