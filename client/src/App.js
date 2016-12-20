import React, { Component } from 'react';

import './css/App.css';
import BottomBar from "./BottomBar";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import TrackInfo from "./TrackInfo";
import { kArtist, kAlbum, kTrack } from "./model/browsingModel";
import { kIsInfoVisible } from "./model/uiModel";
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
  }; }

  render() {
    console.log("App", this.state);
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-flex-ui">
          <div className="st-library st-library-browser-left">
            <ArtistList />
            <AlbumList />
            <TrackList
              artist={this.state.selectedArtist}
              album={this.state.selectedAlbum} />
          </div>

          {this.state.isInfoVisible && <TrackInfo />}
        </div>
        <BottomBar />
      </div>
    );
  }
}

export default App;
