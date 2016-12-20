/* global window */
import React from 'react';
import List from "./List";
import KComponent from "./KComponent";
import { kAlbums, kAlbum, setAlbum } from "./model/browsingModel";

class AlbumList extends KComponent {
  observables() { return {
    albums: kAlbums, selectedAlbum: kAlbum
  }; }

  render() {
    return <List className="st-list st-album-list"
      onClick={({value}) => setAlbum(value)}
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.state.selectedAlbum === null,
        }].concat(this.state.albums.map((album) => {
          return {
            label: `${album.album || "Unknown Album"} (${album.year})`,
            value: album.album,
            isSelected: album.album === this.state.selectedAlbum
          };
        }))} />;
  }
}

export default AlbumList;