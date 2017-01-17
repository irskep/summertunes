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

import { ContextMenu, MenuItem } from "react-contextmenu";

import { kIsConfigReady } from "../config";
import { kArtist, kAlbum, kTrack } from "../model/browsingModel";
import {
  kIsInfoModalOpen,
  kIsSmallUI,
  kUIConfig,
  kUIConfigOptions,
  closeInfoModal,
  openInfoModal,
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


import {
  enqueueTrack,
  playTracks,
} from "../model/playerModel";

const TrackInfoModal = () => {
  return (
    <Modal>
      <div className="st-track-info-modal">
        <div className="st-nav-bar">
          Track Info
          <div className="st-close-button" onClick={closeInfoModal}>
            &times;
          </div>
        </div>
        <TrackInfo />
      </div>
    </Modal>
  );
}

const TrackContextMenu = () => {
  return (
    <ContextMenu id="trackList">
      <MenuItem onClick={(e, data) => openInfoModal(data.item)}>
        info
      </MenuItem>
      <MenuItem onClick={(e, data) => enqueueTrack(data.item)}>
        enqueue
      </MenuItem>
      <MenuItem onClick={(e, data) => playTracks(data.playerQueueGetter(data.i))}>
        play from here
      </MenuItem>
    </ContextMenu>
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
    const outerClassName = (
      `st-rows-${config.length} ` +
      (this.state.isSmallUI ? "st-ui st-small-ui" : "st-ui st-large-ui")
    );
    return (
      <div className="st-app">
        <Toolbar stacked={this.state.isSmallUI} />
        <div className={outerClassName}>
          {config.map((row, i) => {
            const innerClassName = `st-columns-${row.length}`;
            return <div key={i} className={innerClassName} style={{height: rowHeight}}>
              {row.map((item, j) => this.configValueToComponent(item, j))}
            </div>
          })}
        </div>
        <BottomBar />
        {this.state.isInfoModalOpen && <TrackInfoModal />}

        <TrackContextMenu />
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
