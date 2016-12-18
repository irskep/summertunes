/* global window */
import React, { Component, PropTypes } from 'react';
import List from "./List";
import { SERVER_URL } from "./config";
import shallowCompare from 'react-addons-shallow-compare';

class ArtistList extends Component {
  constructor() {
    super();
    this.state = {artistNames: []};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillMount() {
    window.fetch(`${SERVER_URL}/artists`)
      .then((response) => response.json())
      .then(({artists}) => {
        this.setState({artistNames: artists});
      });
  }

  render() {
    return <List className="st-list st-artist-list"
      onClick={this.props.onSelectArtist}
      items={[
        {
          label: "All",
          value: null,
          isSelected: this.props.selectedArtist === null,
        }].concat(this.state.artistNames.map((artistName) => {
          return {
            label: artistName,
            value: artistName,
            isSelected: this.props.selectedArtist === artistName ,
          };
        }))} />;
  }
}

ArtistList.propTypes = {
  selectedArtist: PropTypes.string,
  onSelectArtist: PropTypes.func.isRequired,
};

ArtistList.defaultProps = {
  selectedArtist: null,
};

export default ArtistList;