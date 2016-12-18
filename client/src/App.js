import React, { Component } from 'react';
import './App.css';
import List from "./List";
import Toolbar from "./Toolbar";

const items = [
  {selected: true, label: "Item 1"},
  {selected: false, label: "Item 2"},
];

class App extends Component {
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
            <List className="st-artist-list" alternateColors={false} items={items} />
            <List className="st-album-list" alternateColors={false} items={items} />
            <List className="st-track-list" alternateColors={true} items={items} />
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
