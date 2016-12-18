import React, { Component } from 'react';
import './App.css';
import List from "./List";
import Toolbar from "./Toolbar";
import ArtistList from "./ArtistList";
import AlbumList from "./AlbumList";

const items = [
  {selected: true, label: "Item 1"},
  {selected: false, label: "Item 2"},
];

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedArtist: null,
      selectedAlbum: null,
    };
  }

  render() {
    return (
      <div className="st-app">
        <Toolbar />
        <div className="st-flex-ui">
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

          <div className="st-library st-library-browser-left">
            <ArtistList
              selectedArtist={this.state.selectedArtist}
              onSelectArtist={(item) => this.setState({selectedArtist: item.label})}/>
            <AlbumList
              artist={this.state.selectedArtist}
              selectedAlbum={this.state.selectedAlbum}
              onSelectAlbum={(item) => this.setState({selectedAlbum: item.label})}/>
            <List className="st-list st-track-list" alternateColors={true} items={items} />
          </div>

          <div className="st-info-sidebar">
            Title<br />
            Artist<br />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
