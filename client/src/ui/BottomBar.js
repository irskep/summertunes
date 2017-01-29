import React from 'react';
import KComponent from "../util/KComponent";
import {
  kUIConfigSetter,
  kUIConfigOptions,
  kUIConfig,
} from "../model/uiModel";
import { kPlayerName, setPlayerName } from "../model/playerModel";
import { kPlayerServices, kServerConfig } from "../config";
import "../css/BottomBar.css";
import {
  uiConfigIconMedium,
  uiConfigIconLarge,
} from "../util/svgShapes";

const configKeyToSVG = {
  A: uiConfigIconMedium,
  B: uiConfigIconLarge,
}

console.log(kServerConfig);

class BottomBar extends KComponent {

  observables() { return {
    uiConfigSetter: kUIConfigSetter,
    uiConfigOptions: kUIConfigOptions,
    uiConfig: kUIConfig,
    playerNames: kPlayerServices,
    playerName: kPlayerName,
    config: kServerConfig,
  }; }

  render() {
    return <div className="st-bottom-bar noselect">
      <div className="st-bottom-bar-left-buttons">
        <div className="st-toolbar-button-group">
          {(this.state.playerNames || []).map((name) => {
            return (<div onClick={() => setPlayerName(name)}
                key={name}
                className={this.state.playerName === name ? "st-toolbar-button-selected" : ""}>
              {{
                mpv: "Server",
                web: "Local"
              }[name]}
            </div>)
          })}
        </div>
      </div>

      <div className="st-bottom-bar-right-buttons">
        <div className="st-toolbar-button-group">
          {Object.keys(this.state.uiConfigOptions).sort().map((label) => {
            const isSelected = this.state.uiConfig === label;
            const className = isSelected ? "st-toolbar-button-selected" : "";
            const color = isSelected ? "#eee" : "#666";
            return (
              <div key={label}
                   className={className}
                   onClick={() => this.state.uiConfigSetter(label)}>
                {configKeyToSVG[label] ? configKeyToSVG[label](36, color) : label}
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
