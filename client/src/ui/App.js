import React from 'react';

import '../css/base.css';
import '../css/App.css';

import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";

import { kArtist, kAlbum, kTrack } from "../model/browsingModel";
import {
  kIsInfoVisible,
  kIsMediumUI,
  kIsLargeUI,
  kOpenModal,
  setOpenModal,
} from "../model/uiModel";
import KComponent from "../util/KComponent";

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
    if (this.state.openModal) {
      return (
        <div className="st-app st-app-modal">
          <div className="st-small-ui">
            <div className="st-modal-nav-bar">
              <div className="st-modal-close-button" onClick={setOpenModal.bind(this, null)}>&times;</div>
              {this.state.openModal === "artist" && <div className="st-modal-title">Artist</div>}
              {this.state.openModal === "album" && <div className="st-modal-title">Album</div>}
            </div>
            {this.state.openModal === "artist" && <ArtistList />}
            {this.state.openModal === "album" && <AlbumList />}
          </div>
        </div>
      );
    } else {
      return (
        <div className="st-app">
          <Toolbar stacked={true} />
          <div className="st-small-ui">
            <TrackList />
            {this.state.isInfoVisible && <TrackInfo />}
            <BottomBar artistAndAlbumButtons={true} />
          </div>
        </div>
      );
    }
  }
}

export default App;
