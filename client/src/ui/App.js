import React from 'react';

import '../css/base.css';
import '../css/App.css';

import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";

import { kIsConfigReady } from "../config";
import { kArtist, kAlbum, kTrack } from "../model/browsingModel";
import {
  kIsInfoModalOpen,
  kIsMediumUI,
  kIsLargeUI,
  kOpenModal,
  setOpenModal,
  setIsInfoModalOpen,
} from "../model/uiModel";
import KComponent from "../util/KComponent";

import "../css/modal.css";
class Modal extends React.Component {
  render() {
    return <div className="st-modal-container">
      {this.props.children}
    </div>;
  }
}

const TrackInfoModal = () => {
  return (
    <Modal>
      <div className="st-track-info-modal">
        <div className="st-nav-bar">
          Track Info
          <div className="st-close-button" onClick={() => setIsInfoModalOpen(false)}>
            &times;
          </div>
        </div>
        <TrackInfo />
      </div>
    </Modal>
  );
}

class App extends KComponent {
  observables() { return {
    isConfigReady: kIsConfigReady,

    selectedArtist: kArtist,
    selectedAlbum: kAlbum,
    selectedTrack: kTrack,
    isInfoModalOpen: kIsInfoModalOpen,

    isMediumUI: kIsMediumUI,
    isLargeUI: kIsLargeUI,
    openModal: kOpenModal,
  }; }

  render() {
    if (!this.state.isConfigReady) {
      return <div>Loading config...</div>;
    }
    if (this.state.isLargeUI) {
      return this.renderLargeUI([
        ['albumartist', 'album', 'tracks'],
      ]);
    } else if (this.state.isMediumUI) {
      return this.renderLargeUI([
        ['albumartist', 'album'],
        ['tracks'],
      ]);
    } else {
      return this.renderSmallUI();
    }
  }

  renderLargeUI(config) {
    const rowHeight = `${(1 / config.length) * 100}%`;
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-large-ui">
          {config.map((row, i) => {
            return <div key={i} style={{height: rowHeight}}>
              {row.map((item, j) => {
                switch (item) {
                  case 'albumartist': return <ArtistList key={j}/>;
                  case 'album': return <AlbumList key={j}/>;
                  case 'tracks': return <TrackList key={j}/>;
                  default: return null;
                }
              })}
            </div>
          })}
        </div>
        <BottomBar />
        {this.state.isInfoModalOpen && <TrackInfoModal />}
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
            <BottomBar artistAndAlbumButtons={true} />
          </div>
          {this.state.isInfoModalOpen && <TrackInfoModal />}
        </div>
      );
    }
  }
}

export default App;
