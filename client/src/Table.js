import React, { Component, PropTypes } from 'react';
import "./Table.css";

class Table extends Component {
  render() {
    const className = `${this.props.className} noselect st-table`;
    return (
      <div className={className} style={{overflow: 'auto'}}>
        <table>
          <thead>
            <tr>
              {this.props.columns.map(({name, itemKey}) => (
                <th key={itemKey}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.props.items.map((item, i) => {
              return <tr key={i} onClick={() => this.props.onClick(item)}>
                {this.props.columns.map((column) => (
                  <td key={column.itemKey}>
                    {column.itemKey === 'func'
                      ? column.func(item)
                      : item[column.itemKey]}
                   </td>
                ))}
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

Table.propTypes = {
  columns: PropTypes.array,  // [{name, itemKey}]
  items: PropTypes.array.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Table.defaultProps = {
  style: {},
  className: "",
  onClick: function() { },
};

export default Table;