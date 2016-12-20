import React, { Component, PropTypes } from 'react';
import "./css/Table.css";

class Table extends Component {
  render() {
    const className = `${this.props.className} noselect st-table`;
    return (
      <div className={className} style={{overflow: 'auto', position: 'relative'}}>
        <div style={{position: 'absolute'}}>
          <table>
            <thead>
              <tr>
                {this.props.columns.map(({name, itemKey}) => (
                  <th key={`${itemKey}-${name}`}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.props.items.map((item, i) => {
                return (
                  <tr key={i}
                      className={this.props.selectedItem === item ? "st-table-item-selected" : ""}
                      onClick={() => this.props.onClick(item, i)}>
                    {this.props.columns.map((column) => (
                      <td key={`${column.itemKey}-${column.name}`}>
                        {column.itemKey === 'func'
                          ? column.func(item)
                          : item[column.itemKey]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

Table.propTypes = {
  columns: PropTypes.array,  // [{name, itemKey}]
  items: PropTypes.array.isRequired,
  className: PropTypes.string,
  selectedItem: PropTypes.any,
  onClick: PropTypes.func,
};

Table.defaultProps = {
  className: "",
  onClick: function() { },
};

export default Table;