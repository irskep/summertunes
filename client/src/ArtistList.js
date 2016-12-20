/* global window */
import React from 'react';
import List from "./List";
import { kArtists, kArtist, setArtist } from "./model/browsingModel";
import KComponent from "./KComponent";

class ArtistList extends KComponent {
  observables() { return {
    artists: kArtists, artist: kArtist
  }; }

  render() {
    return <List className="st-list st-artist-list"
      onClick={({value}) => setArtist(value)}
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.props.selectedArtist === null,
        }].concat(this.state.artists.map((artistName) => {
          return {
            label: artistName,
            value: artistName,
            isSelected: this.props.selectedArtist === artistName ,
          };
        }))} />;
  }
}

export default ArtistList;