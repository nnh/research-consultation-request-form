/**
 * Sets the support range values in the output items.
 *
 * @private
 * @param {Array} supportRange - The support range data.
 * @returns {Array} The modified support range.
 */
function setSupportRange_(supportRange) {
  return supportRange.map(([key, _text, _target, flag]) => [key, flag]);
}
/**
 * Sets the default values for items based on the specified items.
 * @param {Map} items - The items.
 * @return {Array} The default values as an array of [key, value] pairs.
 * @private
 */
function setDefaultValues_(items) {
  const defaultValues = [
    ['casesItemName', 50],
    ['facilitiesItemName', 10],
    ['crfItemName', 3500],
  ];
  const commonItemNames = createCommonItemNames_();
  return defaultValues.map(([itemName, defaultValue]) => {
    const key = commonItemNames.get(itemName);
    const value = items.has(key) ? items.get(key) : defaultValue;
    return [key, value];
  });
}
/**
 * Sets the terms for output items based on the specified output items and trial type item names.
 * @param {Map} outputItems - The output items.
 * @param {Map} trialTypeItemNames - The trial type item names.
 * @return {Array} The term values as an array of [key, value] pairs.
 * @private
 */
function setTerms_(outputItems, trialTypeItemNames) {
  const setupTerm = new Map();
  const closingTerm = new Map();
  trialTypeItemNames.forEach((value, key) => {
    const month = key === 'observationalStudiesAndRegistries' ? 3 : 6;
    setupTerm.set(value, month);
    closingTerm.set(value, month);
  });
  const commonItemNames = createCommonItemNames_();
  const fpiToLpo = new GetMonths(
    outputItems.get(commonItemNames.get('fpi'))
  ).getMonthDiff(outputItems.get(commonItemNames.get('lpo')));
  const monthsOfTreatment = outputItems.has(commonItemNames.get('treatmentTerm'))
    ? calculateMonthsFromText_(outputItems.get(commonItemNames.get('treatmentTerm')))
    : null;
  const setupMonths = setupTerm.get(
    outputItems.get(commonItemNames.get('trialTypeItemName'))
  );
  const closingMonths = closingTerm.get(
    outputItems.get(commonItemNames.get('trialTypeItemName'))
  );
  const totalMonths = fpiToLpo + closingMonths + setupMonths;
  return [
    ['fpiToLpo', fpiToLpo],
    ['monthsOfTreatment', monthsOfTreatment],
    ['setupMonths', setupMonths],
    ['closingMonths', closingMonths],
    ['totalMonths', totalMonths],
    ['treatmentYears', roundYear_(monthsOfTreatment)],
    ['totalYears', Math.ceil(totalMonths / 12)],
  ];
}
