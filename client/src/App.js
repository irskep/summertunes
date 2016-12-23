import React from 'react';

import './css/base.css';
import './css/App.css';
import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";
import { kArtist, kAlbum, kTrack } from "./model/browsingModel";
import {
  kIsInfoVisible,
  kIsMediumUI,
  kIsLargeUI,
  kOpenModal,
} from "./model/uiModel";
import KComponent from "./KComponent";

class App extends KComponent {
  observables() { return {
    selectedArtist: kArtist,
    selectedAlbum: kAlbum,
    selectedTrack: kTrack,
    isInfoVisible: kIsInfoVisible,

    isMediumUI: kIsMediumUI,
    isLargeUI: kIsLargeUI,
    openModal: kOpenModal,
  }; }

  render() {
    if (this.state.isLargeUI) {
      return this.renderLargeUI();
    } else if (this.state.isMediumUI) {
      return this.renderMediumUI();
    } else {
      return this.renderSmallUI();
    }
  }

  renderLargeUI() {
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-large-ui">
          <div className="st-library">
            <ArtistList />
            <AlbumList />
            <TrackList />
            {this.state.isInfoVisible && <TrackInfo />}
          </div>

          <BottomBar />
        </div>
      </div>
    );
  }

  renderMediumUI() {
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-medium-ui">
          <div className="st-library">
            <ArtistList />
            <AlbumList />
          </div>
          <TrackList />

          {this.state.isInfoVisible && <TrackInfo />}
          <BottomBar />
        </div>
      </div>
    );
  }

  renderSmallUI() {
    return (
      <div className="st-app">
        <Toolbar stacked={true} />
        <div className="st-small-ui">
          {this.state.openModal === "artist" && <ArtistList />}
          {this.state.openModal === "album" && <AlbumList />}

          {!this.state.openModal && <TrackList />}
          {!this.state.openModal && this.state.isInfoVisible && <TrackInfo />}
          <BottomBar artistAndAlbumButtons={true} />
        </div>
      </div>
    );
  }
}

export default App;
