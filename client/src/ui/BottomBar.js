import React from 'react';
import KComponent from "../util/KComponent";
import { kIsInfoVisible, setIsInfoVisible, setOpenModal, kOpenModal } from "../model/uiModel";
import { kPlayerName, setPlayerName, playerNames } from "../model/playerModel";
import "../css/BottomBar.css";

class BottomBar extends KComponent {

  observables() { return {
    isInfoVisible: kIsInfoVisible,
    openModal: kOpenModal,
    playerName: kPlayerName,
  }; }

  toggleInfo() {
    setIsInfoVisible(!this.state.isInfoVisible)
  }

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
                mpv: "Remote",
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

      <div className="st-toolbar-button-group st-bottom-bar-right-buttons">
        <div onClick={() => this.toggleInfo()}>i</div>
      </div>
    </div>;
  }
}

BottomBar.defaultProps = {
  artistAndAlbumButtons: false,
}

export default BottomBar;