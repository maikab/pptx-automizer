import Automizer, { ChartData, modify, TableRow, TableRowStyle } from './index';
import { vd } from './helper/general-helper';

const automizer = new Automizer({
  templateDir: `${__dirname}/../__tests__/pptx-templates`,
  outputDir: `${__dirname}/../__tests__/pptx-output`,
  removeExistingSlides: true,
});

const run = async () => {
  const data1 = {
    body: [
      {
        label: 'item test r1',
        values: ['test1', 10, 16, 12, 11, 15],
        styles: [
          null,
          <TableRowStyle>{
            color: {
              type: 'srgbClr',
              value: 'ff0000',
            },
            size: 1400,
          },
        ],
      },
      { label: 'item test r2', values: ['test2', 12, 18, 15, 12, 15] },
      {
        label: 'item test r3',
        values: ['test3', 14, 12, 11, 14, 15],
        styles: [
          null,
          null,
          null,
          null,
          <TableRowStyle>{
            color: {
              type: 'srgbClr',
              value: 'ff0000',
            },
            size: 1400,
          },
          // <TableRowStyle>{
          //   color: {
          //     type: 'srgbClr',
          //     value: '00ff00',
          //   },
          //   size: 1400,
          // },
        ],
      },
      {
        label: 'item test r4',
        values: ['test1', 10, 16, 12, 11, 15],
        styles: [
          null,
          <TableRowStyle>{
            color: {
              type: 'srgbClr',
              value: 'ff0000',
            },
            size: 1400,
          },
        ],
      },
      {
        label: 'item test r5',
        values: ['test1', 'r5', 16, 12, 11, 15],
        styles: [],
      },
      {
        label: 'item test r6',
        values: ['test1', 'r6', 16, 12, 11, 15],
        styles: [],
      },
    ],
  };

  const data2 = {
    body: [
      { label: 'item test r1', values: ['test1', 10, 16, 12] },
      { label: 'item test r2', values: ['test2', 12, 18, 15] },
      { label: 'item test r3', values: ['test3', 14, 12, 11] },
      { label: 'item test r4', values: ['test4', 14, 12, 18] },
      { label: 'item test r5', values: ['test5', 14, 13, 15] },
      { label: 'item test r6', values: ['test6', 999, 14, 14] },
      { label: 'item test r7', values: ['test7', 998, 15, 13] },
      { label: 'item test r8', values: ['test8', 997, 16, 19] },
      { label: 'item test r9', values: ['test9', 996, 17, 18] },
    ],
  };

  const data3 = {
    body: [
      <TableRow>{
        label: 'item test r1',
        values: ['test1', 10, 16],
        styles: [
          null,
          <TableRowStyle>{
            color: {
              type: 'srgbClr',
              value: 'ff0000',
            },
            size: 1400,
          },
        ],
      },
      { label: 'item test r2', values: ['test2', 12, 18] },
      { label: 'item test r3', values: ['test3', 14, 12] },
    ],
  };

  const pres = automizer
    .loadRoot(`SlideWithTables.pptx`)
    .load(`SlideWithTables.pptx`, 'tables');

  const result = await pres
    .addSlide('tables', 1, (slide) => {
      slide.modifyElement('TableDefault', [modify.setTable(data1)]);

      // slide.modifyElement('TableWithLabels', [
      //   modify.setTable(data2),
      //   // modify.dump
      // ]);
      //
      // slide.modifyElement('TableWithHeader', [
      //   modify.setTableData(data3),
      //   modify.adjustHeight(data3),
      //   modify.adjustWidth(data3),
      // ]);
    })
    .write(`modify-existing-table.test.pptx`);
};

run().catch((error) => {
  console.error(error);
});
