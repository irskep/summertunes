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

    isMediumUI: kIsMediumUI,
    isLargeUI: kIsLargeUI,
    uiConfig: kUIConfig,
    uiConfigOptions: kUIConfigOptions,
  }; }

  render() {
    if (!this.state.isConfigReady) {
      return <div>Loading config...</div>;
    }
    if (this.state.isSmallUI) {
      return this.renderSmallUI(this.state.uiConfigOptions[this.state.uiConfig]);
    } else {
      console.log(this.state.uiConfig, this.state.uiConfigOptions);
      return this.renderLargeUI(this.state.uiConfigOptions[this.state.uiConfig]);
    }
  }

  configValueToComponent(item, key) {
    switch (item) {
      case 'albumartist': return <ArtistList key={key}/>;
      case 'album': return <AlbumList key={key}/>;
      case 'tracks': return <TrackList key={key}/>;
      default: return null;
    }
  }

  renderLargeUI(config) {
    if (!config) return null;
    const rowHeight = `${(1 / config.length) * 100}%`;
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-large-ui">
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

  renderSmallUI(config) {
    if (!config) return null;
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

export default App;
