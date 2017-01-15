import React from 'react';
import KComponent from "../util/KComponent";
import { setOpenModal, kOpenModal } from "../model/uiModel";
import { kPlayerName, setPlayerName, playerNames } from "../model/playerModel";
import "../css/BottomBar.css";

class BottomBar extends KComponent {

  observables() { return {
    openModal: kOpenModal,
    playerName: kPlayerName,
  }; }

  setOpenModal(modalName) {
    if (this.state.openModal === modalName) {
      setOpenModal(null);
    } else {
      setOpenModal(modalName);
    }
  }

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

      {this.props.artistAndAlbumButtons &&
        <div className="st-toolbar-button-group st-toolbar-modal-button"
              onClick={() => this.setOpenModal("artist")}>
              <div>Artist</div>
      </div>}

      {this.props.artistAndAlbumButtons &&
        <div className="st-toolbar-button-group st-toolbar-modal-button"
              onClick={() => this.setOpenModal("album")}>
              <div>Album</div>
        </div>}
    </div>;
  }
}

BottomBar.defaultProps = {
  artistAndAlbumButtons: false,
}

export default BottomBar;