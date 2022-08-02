import excel, { Style } from 'excel4node';

const xls = (name = 'Laporan DKS') => {
  // Create a new instance of a Workbook class
  const workbook = new excel.Workbook();

  // Add Worksheets to the workbook
  const worksheet = workbook.addWorksheet(name);

  const fontAlignHeading: Style = {
    font: {
      size: 12,
      bold: true,
    },
    alignment: {
      // §18.8.1
      horizontal: 'center',
      vertical: 'center',
    },
  };
  // Create a reusable style
  const headingStyle = workbook.createStyle(fontAlignHeading);

  const border: Style = {
    border: {
      left: {
        style: 'thin',
        color: '#000000',
      },
      right: {
        style: 'thin',
        color: '#000000',
      },
      top: {
        style: 'thin',
        color: '#000000',
      },
      bottom: {
        style: 'thin',
        color: '#000000',
      },
      outline: true,
    },
  };

  const borderWithBg: Style = {
    font: {
      size: 12,
      bold: true,
    },
    border: {
      left: {
        style: 'thin',
        color: '#000000',
      },
      right: {
        style: 'thin',
        color: '#000000',
      },
      top: {
        style: 'thin',
        color: '#000000',
      },
      bottom: {
        style: 'thin',
        color: '#000000',
      },
      outline: true,
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#FFFF00',
      fgColor: '#FFFF00',
    },
  };

  const borderHeadingStyle = { ...border, ...fontAlignHeading };

  const outlineStyle = workbook.createStyle(border);
  const outlineStyleWithBg = workbook.createStyle(borderWithBg);
  const outlineHeadingStyle = workbook.createStyle(borderHeadingStyle);

  return { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle, outlineStyleWithBg };
};

export default xls;
