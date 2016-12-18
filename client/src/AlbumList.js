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

    const query = nextProps.artist
      ? `${SERVER_URL}/albums?albumartist=${nextProps.artist}`
      : `${SERVER_URL}/albums`;

    window.fetch(query)
      .then((response) => response.json())
      .then(({albums}) => {
        this.setState({albumNames: albums.map(({album}) => album)});
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
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.props.selectedAlbum === null,
        }].concat(this.state.albumNames.map((albumName) => {
          return {
            label: albumName,
            value: albumName,
            isSelected: albumName === this.props.selectedAlbum
          };
        }))} />;
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