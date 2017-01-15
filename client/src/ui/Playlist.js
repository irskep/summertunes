import React from 'react';
import KComponent from "../util/KComponent";
import { refreshPlaylist } from "../model/playerModel";

export default class Playlist extends KComponent {
  observables() {
    return {

    };
  }

  componentDidMount() {
    refreshPlaylist();
  }

  render() {
    return <div>Playlist</div>;
  }
};
