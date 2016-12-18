import React, { Component, PropTypes } from 'react';

class List extends Component {
  render() {
    const className = ` st-list ${this.props.alternateColors ? "st-list-alternate-colors" : ""}`;
    return <ul className={this.props.className + className} style={this.props.style}>
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
  onClick: PropTypes.func,
};

List.defaultProps = {
  style: {},
  className: "",
  onClick: function() { },
};

export default List;