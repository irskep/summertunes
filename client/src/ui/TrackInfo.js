import React from 'react';
import KComponent from "../util/KComponent";
import Table from "../uilib/Table";
import { kInfoModalTrack } from "../model/uiModel";

export default class TrackInfo extends KComponent {
  observables() { return {
    track: kInfoModalTrack.log('imt'),
  }; }

  render() {
    if (!this.state.track) return <div className="st-track-info" />;
    return <div className="st-track-info">
      <Table
        columns={[{name: "Key", itemKey: "key"}, {name: "Value", itemKey: "value"}]}
        items={Object
           .keys(this.state.track)
           .sort()
           .map((key) => ({key, value: this.state.track[key]}))}
        />
    </div>;
  }
};