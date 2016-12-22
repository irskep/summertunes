import React from 'react';
import List from "./List";
import KComponent from "./KComponent";
import { kAlbums, kAlbum, setAlbum } from "./model/browsingModel";
import { setOpenModal } from "./model/uiModel";

class AlbumList extends KComponent {
  observables() { return {
    albums: kAlbums, selectedAlbum: kAlbum
  }; }

  componentDidUpdate(prevProps, prevState) {
    if (!this.selectedItemIndex === null) return;
    const y = this.selectedItemIndex * 20;

    if (y >= this.listEl.scrollTop && y <= this.listEl.scrollTop + this.listEl.clientHeight - 20) {
      return;
    }

    if (y < this.listEl.scrollTop) {
      this.listEl.scrollTop = y;
      return;
    }

    if (y > this.listEl.scrollTop + this.listEl.clientHeight - 20) {
      this.listEl.scrollTop = y - this.listEl.clientHeight + 20;
    }
  }

  render() {
    this.selectedItemIndex = this.state.selectedAlbum === null ? 0 : null;
    return <List className="st-list st-album-list st-list"
      ref2={(el) => this.listEl = el}
      onClick={({value}) => {
        setAlbum(value);
        setOpenModal(null);
      }}
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.state.selectedAlbum === null,
        }].concat(this.state.albums.map((album, i) => {
          const isSelected = album.album === this.state.selectedAlbum;
          if (isSelected) this.selectedItemIndex = i + 1;
          return {
            label: `${album.album || "Unknown Album"} (${album.year})`,
            value: album.album,
            isSelected,
          };
        }))} />;
  }
}

export default AlbumList;
