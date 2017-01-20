import React, { PropTypes } from 'react';
import KComponent from "../util/KComponent";
import "../css/Table.css";
import { kUps, kDowns } from "../model/keyboardModel";

const defaultRowFactory = (item, i, props, children) => {
  return <tr {...props}>{children}</tr>;
}

class Table extends KComponent {
  componentDidMount() {
    const self = this;

    this.subscribeWhileMounted(kUps, (e) => {
      if (!self.props.isKeyboardFocused) return;
      e.preventDefault();
      e.stopPropagation();
      if (!self._previousItem) return;
      self.props.onClick(...self._previousItem);
    })

    this.subscribeWhileMounted(kDowns, (e) => {
      if (!self.props.isKeyboardFocused) return;
      e.preventDefault();
      e.stopPropagation();
      if (!self._nextItem) return;
      self.props.onClick(...self._nextItem);
    })
  }

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

    this._previousItem = null;
    this._nextItem = null;

    let lastItemSeen = null;
    let lastItemIndex = null;
    let lastItemWasSelected = false;


    if (!this.props.selectedItem && this.props.items.length) {
      this._nextItem = [this.props.items[0], 0];
      const lastItemIndex = this.props.items.length - 1;
      this._previousItem = [this.props.items[lastItemIndex], lastItemIndex];
    }

    const commitGroup = () => {
      if (!itemsInGroup.length) return;
      if (itemsInGroup.length) {
        rows.push(this.props.renderGroupHeader(itemsInGroup, "title-" + headerKey));
        rows.push(this.renderHeaderRow("header-" + headerKey));
        headerKey += 1;

        for (const item of itemsInGroup) {
          const j = i;
          const isSelected = item && this.props.selectedItem === item;

          if (isSelected) { this._previousItem = [lastItemSeen, lastItemIndex]; }
          if (lastItemWasSelected) { this._nextItem = [item, i]; }

          if (isSelected && !lastItemSeen) {
            this._previousItem = [item, i];  // stick at top
          }

          const trProps = {
            key: i,
            className: isSelected ? "st-table-item-selected" : "",
            onClick: () => this.props.onClick(item, j),
          };

          const tdComponents = this.getColumnValues(inlineColumns, item).map(([column, value], i) => {
            const itemKey = column ? `${column.itemKey}-${column.name}` : i;
            return <td key={`${itemKey}`}>{value}</td>;
          });

          rows.push(this.props.rowFactory(item, i, trProps, tdComponents));
          lastItemSeen = item;
          lastItemWasSelected = isSelected;
          lastItemIndex = i;
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

    if (!this._nextItem) {
      this._nextItem = [lastItemSeen, lastItemIndex];
    }

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
  isKeyboardFocuse: false,
  rowFactory: defaultRowFactory,
};

export default Table;
