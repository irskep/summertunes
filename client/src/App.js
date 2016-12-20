import React, { Component } from 'react';

import './css/base.css';
import './css/App.css';
import './css/uiLarge.css';
import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";
import { kArtist, kAlbum, kTrack } from "./model/browsingModel";
import { kIsInfoVisible, kIsMediumUI, kIsLargeUI } from "./model/uiModel";
import KComponent from "./KComponent";

class DummyList extends Component {
  render() {
    return <div className="st-browser-sidebar">
      <ul>
        <li>Playback Queue</li>
      </ul>

      <h1>Library</h1>
      <ul>
        <li>Library</li>
      </ul>

      <h1>Playlists</h1>
      <ul>
        <li>Unplayed</li>
        <li>Imported from Casey</li>
      </ul>

    </div>;
  }
};

class App extends KComponent {
  observables() { return {
    selectedArtist: kArtist,
    selectedAlbum: kAlbum,
    selectedTrack: kTrack,
    isInfoVisible: kIsInfoVisible,

    isMediumUI: kIsMediumUI,
    isLargeUI: kIsLargeUI,
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
          <div className="st-library st-library-browser-left">
            <ArtistList />
            <AlbumList />
            <TrackList />
          </div>

          {this.state.isInfoVisible && <TrackInfo />}
        </div>
        <BottomBar />
      </div>
    );
  }

  renderMediumUI() {
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-medium-ui">
          <div className="st-library st-library-browser-top">
            <ArtistList />
            <AlbumList />
          </div>
          <TrackList />

          {this.state.isInfoVisible && <TrackInfo />}
        </div>
        <BottomBar />
      </div>
    );
  }

  renderSmallUI() {
    return (
      <div className="st-app">
        <Toolbar stacked={true} />
        <div className="st-large-ui">
          <div className="st-library st-library-browser-left">
            <ArtistList />
            <AlbumList />
            <TrackList />
          </div>

          {this.state.isInfoVisible && <TrackInfo />}
        </div>
        <BottomBar />
      </div>
    );
  }
}

export default App;
