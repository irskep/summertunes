import React, { Component, PropTypes } from 'react';
import "../css/Table.css";

const defaultRowFactory = (item, i, props, children) => {
  return <tr {...props}>{children}</tr>;
}

class Table extends Component {
  inlineColumns() {
    return this.props.columns.filter(({groupSplitter}) => !groupSplitter);
  }

  groupSplitterColumns() {
    return this.props.columns.filter(({groupSplitter}) => groupSplitter);
  }

  getColumnValues(columns, item) {
    return columns
      .map((column, i) => {
        if (!item) return "";
        return [column, column.itemKey === 'func'
          ? column.func(item, i)
          : item[column.itemKey]];
      });
  }

  renderHeaderRow(key) {
    return <tr key={key} className="st-table-group-header-labels">
      {this.inlineColumns().map(({name, itemKey}) => (
        <td key={`${itemKey}-${name}`}>{name}</td>
      ))}
    </tr>
  }

  renderBody() {
    const rows = [];
    let lastGroupKey = "";
    let itemsInGroup = [];

    const inlineColumns = this.inlineColumns();
    const groupSplitterColumns = this.groupSplitterColumns();

    let i = 0;
    let headerKey = 0;

    const commitGroup = () => {
      if (!itemsInGroup.length) return;
      if (itemsInGroup.length) {
        rows.push(this.props.renderGroupHeader(itemsInGroup, "title-" + headerKey));
        rows.push(this.renderHeaderRow("header-" + headerKey));
        headerKey += 1;

        for (const item of itemsInGroup) {
          const j = i;
          const trProps = {
            key: i,
            className: (item && this.props.selectedItem === item) ? "st-table-item-selected" : "",
            onClick: () => this.props.onClick(item, j),
          };
          const tdComponents = this.getColumnValues(inlineColumns, item).map(([column, value], i) => {
            const itemKey = column ? `${column.itemKey}-${column.name}` : i;
            return <td key={`${itemKey}`}>{value}</td>;
          });
          rows.push(this.props.rowFactory(item, i, trProps, tdComponents));
          i++;
        }
      }
      itemsInGroup = [];
    }

    for (const item of this.props.items) {
      const itemGroupKey = JSON.stringify(this.getColumnValues(groupSplitterColumns, item));
      if (itemGroupKey !== lastGroupKey) {
        commitGroup();
        lastGroupKey = itemGroupKey;
      }

      itemsInGroup.push(item);
    }
    commitGroup();

    return <tbody>{rows}</tbody>;
  }

  render() {
    return (
      <div className={`${this.props.className} noselect st-table`}>
        <table>
          {this.renderBody()}
        </table>
      </div>
    );
  }
}

Table.propTypes = {
  columns: PropTypes.array,  // [{name, itemKey}]
  items: PropTypes.array.isRequired,
  renderGroupHeader: PropTypes.func,
  className: PropTypes.string,
  selectedItem: PropTypes.any,
  onClick: PropTypes.func,
};

Table.defaultProps = {
  className: "",
  onClick: () => { },
  renderGroupHeader: () => null,
  rowFactory: defaultRowFactory,
};

export default Table;