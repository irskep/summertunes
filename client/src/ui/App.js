import React from 'react';

import '../css/base.css';
import '../css/App.css';

import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";
import Playlist from "./Playlist";

import { kIsConfigReady } from "../config";
import { kArtist, kAlbum, kTrack } from "../model/browsingModel";
import {
  kIsInfoModalOpen,
  kIsSmallUI,
  kUIConfig,
  kUIConfigOptions,
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

    isSmallUI: kIsSmallUI,
    uiConfig: kUIConfig,
    uiConfigOptions: kUIConfigOptions,
  }; }

  render() {
    if (!this.state.isConfigReady) {
      return <div>Loading config...</div>;
    }

    const config = this.state.uiConfigOptions[this.state.uiConfig];

    if (!config) return null;
    const rowHeight = `${(1 / config.length) * 100}%`;
    return (
      <div className="st-app">
        <Toolbar stacked={this.state.isSmallUI} />
        <div className={this.state.isSmallUI ? "st-ui st-small-ui" : "st-ui st-large-ui"}>
          {config.map((row, i) => {
            return <div key={i} style={{height: rowHeight}}>
              {row.map((item, j) => this.configValueToComponent(item, j))}
            </div>
          })}
        </div>
        <BottomBar />
        {this.state.isInfoModalOpen && <TrackInfoModal />}
      </div>
    );
  }

  configValueToComponent(item, key) {
    switch (item) {
      case 'albumartist': return <ArtistList key={key}/>;
      case 'album': return <AlbumList key={key}/>;
      case 'tracks': return <TrackList key={key}/>;
      case 'queue': return <Playlist key={key}/>;
      default: return null;
    }
  }
}

export default App;
