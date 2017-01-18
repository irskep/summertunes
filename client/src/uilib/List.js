import React, { Component, PropTypes } from 'react';
import { mouseTrap } from '../util/react-mousetrap';

class List extends Component {
  componentWillMount() {
    const self = this;
    this.props.bindShortcut('up', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof self._previousItem === "undefined") return;
      self.props.onClick(self._previousItem);
    });
    this.props.bindShortcut('down', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof self._nextItem === "undefined") return;
      self.props.onClick(self._nextItem);
    });
  }

  render() {
    const className = `${this.props.className} noselect st-list`;
    const items = this.props.items || [];
    delete this._previousItem;
    delete this._nextItem;

    let i = 0;
    for (const item of items) {
      if (item.isSelected) {
        console.log(i);
        if (i > 0) {
          this._previousItem = items[i - 1];
        }
        if (i < items.length - 1) {
          this._nextItem = items[i + 1];
        }
      }
      i += 1;
    }

    return <ul
        ref={(el) => { if (this.props.ref2) this.props.ref2(el); }}
        className={className}
        style={this.props.style}>
      {items.map((item, i) => {
        return <li key={i}
                   onClick={() => this.props.onClick(item, i)}
                   className={item.isSelected ? "st-list-item-selected" : ""}>
          {item.label}
         </li>;
      })}
    </ul>;
  }
}

List.propTypes = {
  items: PropTypes.array,
  style: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

List.defaultProps = {
  style: {},
  className: "",
  onClick: function() { },
  onNext: function() { },
  onPrevious: function() { },
};

export default mouseTrap(List);
