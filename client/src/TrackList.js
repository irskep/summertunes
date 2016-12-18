/* global window */
import React, { Component, PropTypes } from 'react';
import Table from "./Table";
import { SERVER_URL } from "./config";
import shallowCompare from 'react-addons-shallow-compare';
import secondsToString from "./secondsToString";
import trackQueryString from "./trackQueryString";

class TrackList extends Component {
  constructor() {
    super();
    this.state = {tracks: []};
  }

  query(props) {
    return `${SERVER_URL}/tracks?${trackQueryString(props)}`;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  update(nextProps) {
    this.setState({tracks: []});

    if (!trackQueryString(nextProps)) return;

    window.fetch(this.query(nextProps))
      .then((response) => response.json())
      .then(({tracks}) => {
        this.setState({tracks: tracks.slice(0, 200)});
      });
  }

  componentWillMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.query(this.props)) === JSON.stringify(this.query(nextProps))) return;
    this.update(nextProps);
  }

  render() {
    return <Table className="st-track-list"
      onClick={this.props.onSelectTrack}
      selectedItem={this.props.selectedTrack}
      columns={[
        {name: 'Track Number', itemKey: 'track'},
        {name: 'Title', itemKey: 'title'},
        {name: 'Album Artist', itemKey: 'albumartist'},
        {name: 'Album', itemKey: 'album'},
        {name: 'Year', itemKey: 'year'},
        {name: 'Time', itemKey: 'func', func: (item) => secondsToString(item.length)},
        {name: 'Disc Number', itemKey: 'disc'},
      ]}
      items={this.state.tracks} />;
  }
}

TrackList.propTypes = {
  artist: PropTypes.string,
  album: PropTypes.string,
  selectedTrack: PropTypes.any,
  onSelectTrack: PropTypes.func.isRequired,
};

TrackList.defaultProps = {
  artist: null,
  album: null,
};

export default TrackList;