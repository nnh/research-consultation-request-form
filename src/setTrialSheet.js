/**
 * Set the values in the trial sheet based on the input data.
 *
 * @param {Sheet} sheet - The trial sheet to set the values in.
 * @param {Map} inputData - The input data containing the values for the trial sheet.
 * @param {string} targetYear - The target year for the trial sheet.
 * @returns {Array[]} The updated trial sheet values.
 * @private
 */
function setTrialSheetValues_(sheet, inputData, targetYear) {
  const trialValues = sheet.getDataRange().getValues();
  const trialIdx = new Map([
    ['headerCol', 0],
    ['bodyCol', 1],
    ['yearCol', 2],
  ]);
  const trialValueList = prepareTrialSheetValues_(inputData, targetYear);
  const commentStart = new Map();
  const trialTypeMap = createTrialTypeItemNamesMap_();
  const commonItemNames = createCommonItemNames_();
  const setTrialValues = trialValues.map((x, idx) => {
    const header = x[trialIdx.get('headerCol')];
    const body = trialValueList.has(header)
      ? trialValueList.get(header)
      : x[trialIdx.get('bodyCol')];
    const year =
      header !== targetYear
        ? header === commonItemNames.get('trialTypeItemName')
          ? body === trialTypeMap.get('observationalStudiesAndRegistries')
            ? 1
            : body === trialTypeMap.get('specifiedClinicalTrial')
            ? 3
            : body === trialTypeMap.get('interventionStudies')
            ? 2
            : 5
          : x[trialIdx.get('yearCol')]
        : 1;
    if (header === commonItemNames.get('trialTypeItemName')) {
      sheet.getRange(`B${idx + 1}`).clearDataValidations();
    }
    if (header === 'Comment') {
      commentStart.set('row', idx + 1);
    }
    return [header, body, year];
  });
  sheet
    .getRange(1, 1, setTrialValues.length, setTrialValues[0].length)
    .setValues(setTrialValues);
  sheet
    .getRange(commentStart.get('row'), 2, inputData.get('comments').length, 1)
    .setValues(inputData.get('comments'));
  return setTrialValues;
}
/**
 * Prepare the trial sheet values based on the input data and target year.
 *
 * @param {Map} inputData - The input data containing the values for the trial sheet.
 * @param {string} targetYear - The target year for the trial sheet.
 * @returns {Map} The prepared trial sheet values.
 * @private
 */
function prepareTrialSheetValues_(inputData, targetYear) {
  const commonItemNames = createCommonItemNames_();
  const trialValueList = new Map([
    ['発行年月日', new Date()],
    [
      commonItemNames.get('trialTypeItemName'),
      inputData.get(commonItemNames.get('trialTypeItemName')),
    ],
    [
      commonItemNames.get('crfItemName'),
      inputData.get(commonItemNames.get('crfItemName')),
    ],
    [
      commonItemNames.get('facilitiesItemName'),
      inputData.get(commonItemNames.get('facilitiesItemName')),
    ],
    [
      commonItemNames.get('casesItemName'),
      inputData.get(commonItemNames.get('casesItemName')),
    ],
    [targetYear, targetYear],
    ['係数', 1],
  ]);
  return trialValueList;
}
