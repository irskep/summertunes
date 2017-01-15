import React from 'react';
import List from "../uilib/List";
import KComponent from "../util/KComponent";
import {
    kFilteredAlbums,
    kAlbum,
    setAlbum,
    setAlbumFilter,
    kAlbumFilter,
} from "../model/browsingModel";
// import { setOpenModal } from "../model/uiModel";

class AlbumList extends KComponent {
  observables() { return {
    albums: kFilteredAlbums, selectedAlbum: kAlbum, albumFilter: kAlbumFilter,
  }; }

  componentDidMount() {
    this.scrollToSelection();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollToSelection();
  }

  scrollToSelection() {
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

  onChangeAlbumFilter(e) {
    setAlbumFilter(e.target.value);
  }

  render() {
    this.selectedItemIndex = this.state.selectedAlbum === null ? 0 : null;
    const listItems = [
      {
        label: "All",
        value: null,
        isSelected: this.state.selectedAlbum === null,
      }].concat(this.state.albums.map((album, i) => {
        const isSelected = ("" + album.id) === this.state.selectedAlbum;
        if (isSelected) this.selectedItemIndex = i + 1;
        return {
          label: `${album.album || "Unknown Album"} (${album.year})`,
          value: album.id,
          isSelected,
        };
      }));

    return (
      <div className="st-album-list st-app-overflowing-section">
        <input
          className="st-filter-control"
          value={this.state.albumFilter}
          onChange={this.onChangeAlbumFilter}
          placeholder="Filter" />
        <List className="st-list st-list-under-filter-control"
          ref2={(el) => this.listEl = el}
          onClick={({value}) => {
            setAlbum(value);
            // setOpenModal(null);
          }}
          items={listItems} />
      </div>
    );
  }
}

export default AlbumList;
