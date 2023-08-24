function processForm() {
  const res = getFormResponses_();
  if (res.resError !== null || res.resList === null) {
    return;
  }
  const latestResponse = getLatestResponse_(res.resList);
  const error = processFormResponses_(latestResponse);
  if (isErrorObject_(error.res.error)) {
    console.log(error.res.error);
  }
}
/**
 * Get form responses.
 *
 * @returns {Object} The form responses.
 * @private
 */
function getFormResponses_() {
  const maxRetryCount = 2;
  let resError = null;
  let retryCount = 0;
  let resList;
  while (retryCount < maxRetryCount) {
    try {
      resList = FormApp.getActiveForm().getResponses();
      resError = null;
      break;
    } catch (error) {
      resError = error;
      Utilities.sleep(1000);
    }
    retryCount++;
  }
  return {
    resList,
    resError,
  };
}
/**
 * Get the latest form response from the responses array.
 *
 * @param {Array} responses - Array of form responses.
 * @returns {Object} - Latest form response.
 */
function getLatestResponse_(responses) {
  return responses[responses.length - 1];
}
/**
 * Process the form responses.
 *
 * @param {Object} response - The form response to process.
 * @returns {Object} The processed form response.
 * @private
 */
function processFormResponses_(response) {
  const res = {};
  const editUrl = response.getEditResponseUrl();
  const items = quotegenerator2.getItemsFromFormRequests(response);
  const inputData = editInputItems_(items);
  const [createSpreadsheetRes, pdfId] = createSpreadsheet_(inputData);
  const commonItemNames = createCommonItemNames_();
  const user = items.has(commonItemNames.get('replyToEmailAddress'))
    ? items.get(commonItemNames.get('replyToEmailAddress'))
    : response.getRespondentEmail();
  gmailAppCommon.executeSendEmail(
    user,
    '概算見積の作成が完了しました',
    '概算見積の作成が完了しました。\n添付ファイルをご確認ください。',
    new Map([
      ['fileIdList', [[pdfId, MimeType.PDF]]],
      ['noReply', true],
    ])
  );
  if (typeof createSpreadsheetRes === 'string') {
    const [title, ss] = createSpreadsheetRes.split('|||');
    res.title = title;
    res.ss = ss;
  } else {
    res.error = createSpreadsheetRes;
  }
  const result = {
    res,
    editUrl,
    user,
    items,
  };
  return result;
}
