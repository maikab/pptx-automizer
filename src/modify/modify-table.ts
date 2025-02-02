import { XmlHelper } from '../helper/xml-helper';
import ModifyXmlHelper from '../helper/modify-xml-helper';
import { TableData, TableRow, TableRowStyle } from '../types/table-types';
import { Modification, ModificationTags } from '../types/modify-types';
import ModifyTextHelper from '../helper/modify-text-helper';
import { ModifyColorHelper } from '../index';
import { XmlDocument, XmlElement } from '../types/xml-types';

export class ModifyTable {
  data: TableData;
  table: ModifyXmlHelper;
  xml: XmlDocument | XmlElement;

  constructor(table: XmlDocument | XmlElement, data?: TableData) {
    this.data = data;

    this.table = new ModifyXmlHelper(table);
    this.xml = table;
  }

  modify(): ModifyTable {
    this.setRows();
    this.setGridCols();

    this.sliceRows();
    this.sliceCols();

    return this;
  }

  setRows() {
    this.data.body.forEach((row: TableRow, r: number) => {
      row.values.forEach((cell: number | string, c: number) => {
        const rowStyles = row.styles && row.styles[c] ? row.styles[c] : {};
        this.table.modify(
          this.row(r, this.column(c, this.cell(cell, rowStyles))),
        );
        this.table.modify({
          'a16:rowId': {
            index: r,
            modify: ModifyXmlHelper.attribute('val', r),
          },
        });
      });
    });
  }

  setGridCols() {
    this.data.body[0]?.values.forEach((cell, c: number) => {
      this.table.modify({
        'a:gridCol': {
          index: c,
        },
        'a16:colId': {
          index: c,
          modify: ModifyXmlHelper.attribute('val', c),
        },
      });
    });
  }

  sliceRows() {
    this.table.modify({
      'a:tbl': this.slice('a:tr', this.data.body.length),
    });
  }

  sliceCols() {
    this.table.modify({
      'a:tblGrid': this.slice('a:gridCol', this.data.body[0]?.values.length),
    });
  }

  row = (index: number, children: ModificationTags): ModificationTags => {
    return {
      'a:tr': {
        index: index,
        children: children,
      },
    };
  };

  column = (index: number, children: ModificationTags): ModificationTags => {
    return {
      'a:tc': {
        index: index,
        children: children,
      },
    };
  };

  cell = (value: number | string, style?: TableRowStyle): ModificationTags => {
    return {
      'a:t': {
        modify: ModifyTextHelper.content(value),
      },
      'a:rPr': {
        modify: ModifyTextHelper.style(style),
      },
      ...this.setCellBackground(style),
    };
  };

  setCellBackground(style) {
    if (!style.background) {
      return {};
    }

    return {
      'a:tcPr': {
        modify: ModifyColorHelper.solidFill(style.background, 'last'),
      },
    };
  }

  slice(tag: string, length: number): Modification {
    return {
      children: {
        [tag]: {
          collection: (collection: HTMLCollectionOf<XmlElement>) => {
            XmlHelper.sliceCollection(collection, length);
          },
        },
      },
    };
  }

  adjustHeight() {
    const tableHeight = this.getTableSize('cy');
    const rowHeight = tableHeight / this.data.body.length;

    this.data.body.forEach((row: TableRow, r: number) => {
      this.table.modify({
        'a:tr': {
          index: r,
          modify: ModifyXmlHelper.attribute('h', Math.round(rowHeight)),
        },
      });
    });

    return this;
  }

  adjustWidth() {
    const tableWidth = this.getTableSize('cx');
    const rowWidth = tableWidth / this.data.body[0]?.values?.length || 1;

    this.data.body[0]?.values.forEach((cell, c: number) => {
      this.table.modify({
        'a:gridCol': {
          index: c,
          modify: ModifyXmlHelper.attribute('w', Math.round(rowWidth)),
        },
      });
    });

    return this;
  }

  setSize(orientation: 'cx' | 'cy', size: number): void {
    const sizeElement = this.xml
      .getElementsByTagName('p:xfrm')[0]
      .getElementsByTagName('a:ext')[0];

    sizeElement.setAttribute(orientation, String(size));
  }

  getTableSize(orientation: string): number {
    return Number(
      this.xml
        .getElementsByTagName('p:xfrm')[0]
        .getElementsByTagName('a:ext')[0]
        .getAttribute(orientation),
    );
  }
}
