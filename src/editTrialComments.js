/**
 * Generate comments based on the input data.
 *
 * @param {Map} inputData - The input data containing the values for generating comments.
 * @returns {string[]} An array of comments generated based on the input data.
 * @private
 */
function editComments_(inputData) {
  const commonItemNames = createCommonItemNames_();
  const fpi = inputData.get(commonItemNames.get('fpi'));
  const lpo = inputData.get(commonItemNames.get('lpo'));
  const startDate = calculateAgoDate_(fpi, inputData.get('setupMonths'));
  const endDate = calculateFutureDate_(lpo, inputData.get('closingMonths'));
  const yearText =
    inputData.get('totalYearsText') > 0
      ? `${inputData.get('totalYearsText')}年`
      : '';
  const monthText =
    inputData.get('totalMonthsText') > 0
      ? `${inputData.get('totalMonthsText')}ヶ月`
      : '';
  const comments = [
    `契約期間は${formatDateToString_(startDate)}〜${formatDateToString_(
      endDate
    )} (${yearText}${monthText}間）を想定しております。`,
    `参加施設数を${inputData.get(
      commonItemNames.get('facilitiesItemName')
    )}施設と想定しております。`,
    `CRFのべ項目数を一症例あたり${inputData.get(
      commonItemNames.get('crfItemName')
    )}項目と想定しております。`,
    `目標症例数を${inputData.get(
      commonItemNames.get('casesItemName')
    )}例と想定しております。`,
    `解析帳票数を${inputData.get('finalAnalysisCount')}表と想定しております。`,
    '諸経費・間接経費は全て各項目の見積に含まれています。',
    '試験開始後のEDC(eCRF)変更・修正の費用を含みません。',
  ].map(x => createComment_(x));
  return comments;
}
/**
 * Calculate a date that is a specified number of months before the given date.
 *
 * @param {Date} date - The reference date.
 * @param {number} months - The number of months to go back.
 * @returns {Date} The calculated date.
 * @private
 */
function calculateAgoDate_(date, months) {
  const modifiedDate = new GetMonths(date);
  return modifiedDate.getAgoDate(months);
}
/**
 * Calculate a date that is a specified number of months ahead of the given date.
 *
 * @param {Date} date - The reference date.
 * @param {number} months - The number of months to go ahead.
 * @returns {Date} The calculated date.
 * @private
 */
function calculateFutureDate_(date, months) {
  const modifiedDate = new GetMonths(date);
  return modifiedDate.getFutureDate(months);
}
/**
 * Create a comment from the given text.
 *
 * @param {string} text - The text of the comment.
 * @returns {string[]} An array containing the comment text.
 * @private
 */
function createComment_(text) {
  return [text];
}
