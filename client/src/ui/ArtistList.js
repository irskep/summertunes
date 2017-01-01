/* global window */
import React            from 'react';
import List             from "../uilib/List";
import {
    kArtist,
    setArtist,

    kArtistFilter,
    setArtistFilter,
    kFilteredArtists,
}                       from "../model/browsingModel";
import KComponent       from "../util/KComponent";
import { setOpenModal } from "../model/uiModel";


class ArtistList extends KComponent {
  observables() { return {
    artists: kFilteredArtists,
    artist: kArtist,
    artistFilter: kArtistFilter,
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

  onChangeArtistFilter(e) {
    setArtistFilter(e.target.value);
  }

  render() {
    this.selectedItemIndex = this.state.artist === null ? 0 : null;
    return (
      <div className="st-artist-list st-app-overflowing-section">
        <input
          className="st-filter-control"
          value={this.state.artistFilter}
          onChange={this.onChangeArtistFilter}
          placeholder="Filter" />
        <List className="st-list st-list-under-filter-control"
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
            }))} />
      </div>
    );
  }
}

export default ArtistList;
