/* global window */
import React from 'react';
import List from "./uilib/List";
import { kArtists, kArtist, setArtist } from "./model/browsingModel";
import KComponent from "./util/KComponent";
import { setOpenModal } from "./model/uiModel";

class ArtistList extends KComponent {
  observables() { return {
    artists: kArtists, artist: kArtist
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
    this.selectedItemIndex = this.state.artist === null ? 0 : null;
    return <List className="st-list st-artist-list st-list"
      ref2={(el) => this.listEl = el}
      onClick={({value}) => {
        setArtist(value);
        setOpenModal(null);
      }}
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.state.artist === null,
        }].concat(this.state.artists.map((artistName, i) => {
          const isSelected = this.state.artist === artistName;
          if (isSelected) this.selectedItemIndex = i + 1;
          return {
            label: artistName,
            value: artistName,
            isSelected,
          };
        }))} />;
  }
}

export default ArtistList;
