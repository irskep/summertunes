/* global window */
import React from 'react';
import Table from "./Table";
import KComponent from "./KComponent"
import secondsToString from "./util/secondsToString";

import { kTrackList, kTrackIndex, setTrackIndex } from "./model/browsingModel";

class TrackList extends KComponent {
  observables() { return {
    tracks: kTrackList,
    trackIndex: kTrackIndex,
  }; }

  render() {
    return <Table className="st-track-list"
      onClick={(item, i) => setTrackIndex(i)}
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