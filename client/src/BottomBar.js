import React from 'react';
import KComponent from "./KComponent";
import { kIsInfoVisible, setIsInfoVisible, setOpenModal, kOpenModal } from "./model/uiModel";
import "./css/BottomBar.css";

class BottomBar extends KComponent {

  observables() { return {
    isInfoVisible: kIsInfoVisible,
    openModal: kOpenModal,
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