import React, { Component, PropTypes } from 'react';

class List extends Component {
  render() {
    const className = `${this.props.className} noselect st-list`;
    return <ul
        ref={(el) => { if (this.props.ref2) this.props.ref2(el); }}
        className={className}
        style={this.props.style}>
      {(this.props.items || []).map((item, i) => {
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
};

export default List;