/* global window */
import React, { Component, PropTypes } from 'react';
import Table from "./Table";
import { SERVER_URL } from "./config";
import shallowCompare from 'react-addons-shallow-compare';
import secondsToString from "./secondsToString";

function queryString(obj) {
  const components = [];
  for (const k of Object.keys(obj)) {
    if (obj[k] !== null) {
      components.push(`${k}=${encodeURIComponent(obj[k])}`);
    }
  }
  return components.join('&');
}

class TrackList extends Component {
  constructor() {
    super();
    this.state = {tracks: []};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  update(nextProps) {
    this.setState({tracks: []});

    const query = `${SERVER_URL}/tracks?${queryString({
        albumartist: this.props.artist,
        album: this.props.album,
      })}`;

    window.fetch(query)
      .then((response) => response.json())
      .then(({tracks}) => {
        console.log(tracks[0]);
        this.setState({tracks: tracks.slice(0, 200)});
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
    return <Table className="st-track-list"
      onClick={this.props.onSelectTrack}
      columns={[
        {name: 'Track Number', itemKey: 'track'},
        {name: 'Title', itemKey: 'title'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
        {name: 'Album Artist', itemKey: 'albumartist'},
        {name: 'Album', itemKey: 'album'},
        {name: 'Year', itemKey: 'year'},
        {name: 'Disc Number', itemKey: 'disc'},
      ]}
      items={this.state.tracks} />;
  }
}

TrackList.propTypes = {
  artist: PropTypes.string,
  album: PropTypes.string,
  onSelectTrack: PropTypes.func.isRequired,
};

TrackList.defaultProps = {
  artist: null,
  album: null,
};

export default TrackList;