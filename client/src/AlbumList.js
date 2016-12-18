/* global window */
import React, { Component, PropTypes } from 'react';
import List from "./List";
import { SERVER_URL } from "./config";
import shallowCompare from 'react-addons-shallow-compare';

class AlbumList extends Component {
  constructor() {
    super();
    this.state = {albumNames: []};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }


  update(nextProps) {
    this.setState({albumNames: []});
    if (!nextProps.artist) return;

    window.fetch(`${SERVER_URL}/artists/${nextProps.artist}`)
      .then((response) => response.json())
      .then(({albums}) => {
        this.setState({albumNames: albums});
      });
  }

  componentWillMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.artist === this.props.artist) return;
    this.update(nextProps);
  }

  render() {
    return <List className="st-list st-album-list"
      onClick={this.props.onSelectAlbum}
      items={this.state.albumNames.map((albumName) => {
        return {label: albumName, isSelected: albumName === this.props.selectedAlbum};
      })} />;
  }
}

AlbumList.propTypes = {
  artist: PropTypes.string,
  selectedAlbum: PropTypes.string,
  onSelectAlbum: PropTypes.func.isRequired,
};

AlbumList.defaultProps = {
  selectedAlbum: null,
};

export default AlbumList;