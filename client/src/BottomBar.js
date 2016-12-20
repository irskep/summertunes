import React from 'react';
import KComponent from "./KComponent";
import { kIsInfoVisible, setIsInfoVisible } from "./model/uiModel";
import "./css/BottomBar.css";

class BottomBar extends KComponent {

  observables() { return {
    isInfoVisible: kIsInfoVisible,
  }; }

  toggleInfo() {
    setIsInfoVisible(!this.state.isInfoVisible)
  }

  render() {
    return <div className="st-bottom-bar">
      <div className="st-toolbar-button-group st-bottom-bar-right-buttons">
        <div onClick={() => this.toggleInfo()}>i</div>
      </div>
    </div>;
  }
}

export default BottomBar;