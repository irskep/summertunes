import React, { Component } from 'react';
import './css/App.css';
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";
import TrackList from "./TrackList";
import Table from "./Table";
import { playTrack } from "./mpv";

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedArtist: null,
      selectedAlbum: null,
      selectedTrack: null,
    };
  }

  selectTrack(track) {
    if (this.state.selectedTrack === track) {
      playTrack(track);
    } else {
      this.setState({selectedTrack: track});
    }
  }

  render() {
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-flex-ui">
          {/*
          <div className="st-browser-sidebar">
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

          </div>
          */}

          <div className="st-library st-library-browser-left">
            <ArtistList
              selectedArtist={this.state.selectedArtist}
              onSelectArtist={(item) => this.setState({
                selectedArtist: item.value,
                selectedAlbum: null,
              })}/>
            <AlbumList
              artist={this.state.selectedArtist}
              selectedAlbum={this.state.selectedAlbum}
              onSelectAlbum={(item) => this.setState({selectedAlbum: item.value})}/>
            <TrackList
              artist={this.state.selectedArtist}
              album={this.state.selectedAlbum}
              selectedTrack={this.state.selectedTrack}
              onSelectTrack={(item) => this.selectTrack(item) }/>
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
