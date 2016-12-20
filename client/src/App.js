import React, { Component } from 'react';

import './css/App.css';
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import Table from "./Table";
import { kArtist, kAlbum, kTrack } from "./model/browsingModel";
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

          <div className="st-info-sidebar">
            <Table
              columns={[{name: "Key", itemKey: "key"}, {name: "Value", itemKey: "value"}]}
              items={!this.state.selectedTrack ? [] : Object.keys(this.state.selectedTrack)
                 .map((key) => {
                   return {key, value: this.state.selectedTrack[key]};
                 })}
              />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
