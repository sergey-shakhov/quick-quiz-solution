import mjml2html from 'mjml';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import toString from 'lodash/toString';

type CellValue = string | number | boolean | undefined;

type NotificationStatus = 'positive' | 'negative' | 'neutral';

type NotificationAction = {
  text: string;
  href: string;
};

type NotificationContent = {
  status: NotificationStatus;
  subject: string;
  summary: string;
  details: string;
  params?: Array<{ key: string, value: string }>;
  action?: NotificationAction;
  tableData?: Array<Array<CellValue>>;
  conclusion: string;
};

function generate(content: NotificationContent) {
  const tableMarkup = () => {
    if (isEmpty(content.tableData)) {
      return '';
    }

    const cellMarkup = (cell: CellValue) => {
      const cellStyles = 'border-top: 1px solid #dddddd; border-left: 1px solid #dddddd;';
      if (isUndefined(cell)) {
        return `<td style="${cellStyles}}">-</td>`;
      }
      if (isNumber(cell)) {
        return `<td style="align: right; ${cellStyles}">${cell}</td>`;
      }
      if (isString(cell)) {
        return `<td style="${cellStyles}">${cell}</td>`;
      }
      if (isBoolean(cell)) {
        return `<td style="${cellStyles}">${cell ? 'Да' : 'Нет'}</td>`;
      }

    };

    const rowMarkup = (row: Array<CellValue>) => {
      return `<tr>${map(row, (cell) => cellMarkup(cell)).join('')}</tr>`;
    };

    return `<mj-table border="1px" cellpadding="4px">
      ${map(content.tableData, (row) => rowMarkup(row)).join('')}
    </mj-table>`;
  };

  const paramsMarkup = () => {
    if (isEmpty(content.params)) {
      return '';
    }

    return map(content.params, (param: { key: string, value: string }) => {
      return `<mj-text><b>${param.key}:</b> ${param.value}</mj-text>`;
    });
  };

  const actionMarkup = () => {
    if (isEmpty(content.action)) {
      return '';
    }

    return `<mj-button font-family="Helvetica" background-color="#1095c1" color="white" href="${content.action.href}" font-size="16px" font-weight="700">
        ${content.action.text}
      </mj-button>`;
  };

  const statusToColor = (status: NotificationStatus) => {
    switch (status) {
      case 'positive':
        return '#ddffdd';
      case 'negative':
        return '#ffdddd';
      default:
        return '#dddddd';
    }
  };

  const options = {};
  const mjml = `
    <mjml>
      <mj-body>
        <mj-section background-color="${statusToColor(content.status)}">
          <mj-column>
            <mj-text font-weight="700">
              ${content.summary}
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section>
          <mj-column>
            ${paramsMarkup()}
            <mj-text>
              ${content.details}
            </mj-text>
            ${actionMarkup()}
            ${tableMarkup()}

            <mj-text>
              ${content.conclusion}
            </mj-text>

          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
  const result = mjml2html(mjml, options);

  return result.html;
}

export {
  generate,
  NotificationContent,
  NotificationStatus,
  CellValue,
};
