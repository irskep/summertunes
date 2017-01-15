import React from 'react';
import KComponent from "../util/KComponent";
import Table from "../uilib/Table";
import { kInfoModalTrack } from "../model/browsingModel";

export default class TrackInfo extends KComponent {
  observables() { return {
    track: kInfoModalTrack,
  }; }

  render() {
    if (!this.state.track) return <div className="st-track-info" />;
    return <div className="st-track-info">
      <Table
        columns={[{name: "Key", itemKey: "key"}, {name: "Value", itemKey: "value"}]}
        items={Object.keys(this.state.track).map((key) => ({key, value: this.state.track[key]}))}
        />
    </div>;
  }
};