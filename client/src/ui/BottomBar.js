import React from 'react';
import KComponent from "../util/KComponent";
import {
  kUIConfigSetter,
  kUIConfigOptions,
  kUIConfig,
} from "../model/uiModel";
import { kPlayerName, setPlayerName, playerNames } from "../model/playerModel";
import "../css/BottomBar.css";

class BottomBar extends KComponent {

  observables() { return {
    uiConfigSetter: kUIConfigSetter,
    uiConfigOptions: kUIConfigOptions,
    uiConfig: kUIConfig,
    playerName: kPlayerName,
  }; }

  render() {
    return <div className="st-bottom-bar noselect">
      <div className="st-bottom-bar-left-buttons">
        <div className="st-toolbar-button-group">
          {playerNames.map((name) => (
            <div onClick={() => setPlayerName(name)}
                key={name}
                className={this.state.playerName === name ? "st-toolbar-button-selected" : ""}>
              {{
                mpv: "Server",
                web: "Local"
              }[name]}
            </div>
          ))}
        </div>
      </div>

      <div className="st-bottom-bar-right-buttons">
        <div className="st-toolbar-button-group">
          {Object.keys(this.state.uiConfigOptions).sort().map((label) => {
            const className = this.state.uiConfig === label ? "st-toolbar-button-selected" : "";
            return (
              <div key={label}
                   className={className}
                   onClick={() => this.state.uiConfigSetter(label)}>
                {label}  
              </div>
            );
          })}
        </div>
      </div>
    </div>;
  }
}

BottomBar.defaultProps = {
  artistAndAlbumButtons: false,
}

export default BottomBar;