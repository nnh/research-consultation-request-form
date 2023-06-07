/**
 * Edit input items.
 *
 * @param {Array} items - The input items to edit.
 * @returns {Array} The edited input items.
 * @private
 */
function editInputItems_(items) {
  const outputItems = editOutputItems_(items);
  return outputItems;
}
/**
 * Create support range data based on trial type.
 *
 * @param {Map} trialTypeItemNames - The map of trial type item names.
 * @param {string} trialType - The trial type identifier.
 * @returns {Array} The support range data.
 * @private
 */
function createSupportRangeData_(trialTypeItemNames, trialType) {
  const trialTypeMapKeys = new Set(trialTypeItemNames.keys());
  const targetIdx = 2;
  return [
    ['protocolDevelopmentSupport', 'プロトコル作成支援', trialTypeMapKeys],
    [
      'clinicalTrialOffice',
      '調整事務局',
      new Set(['investigatorInitiatedTrial', 'advancedMedical']),
    ],
    ['datacenter', 'データセンター', trialTypeMapKeys],
    [
      'monitoring',
      '実地モニタリング',
      new Set(['investigatorInitiatedTrial', 'advancedMedical']),
    ],
    ['statisticalAnalysis', '統計解析', trialTypeMapKeys],
    [
      'csr',
      'CSR作成',
      new Set([
        'investigatorInitiatedTrial',
        'advancedMedical',
        'specifiedClinicalTrial',
      ]),
    ],
  ].map(values => [
    ...values,
    isTrialTypeInTarget_(trialTypeItemNames, trialType, values[targetIdx]),
  ]);
}
/**
 * Set the support range text based on the support range data.
 *
 * @param {Array} supportRange - The support range data.
 * @returns {string} The support range text.
 * @private
 */
function setSupportRangeText_(supportRange) {
  return supportRange
    .filter(([_key, _text, _target, flag]) => flag)
    .map(([_key, text, _target, _flag]) => text)
    .join(', ');
}
/**
 * Set the final analysis count based on the trial type.
 *
 * @param {Map} trialTypeItemNames - The map of trial type item names.
 * @param {string} trialType - The trial type identifier.
 * @returns {number} The final analysis count.
 * @private
 */
function setFinalAnalysisCount_(trialTypeItemNames, trialType) {
  return trialType === trialTypeItemNames.get('investigatorInitiatedTrial')
    ? 100
    : 50;
}
/**
 * Edit the output items.
 *
 * @param {Map} items - The input items to edit.
 * @returns {Map} The edited output items.
 * @private
 */
function editOutputItems_(items) {
  const trialTypeItemNames = createTrialTypeItemNamesMap_();
  const commonItemNames = createCommonItemNames_();
  const supportRange = createSupportRangeData_(
    trialTypeItemNames,
    items.get(commonItemNames.get('trialTypeItemName'))
  );
  const outputItems = new Map(items);
  outputItems.set(
    commonItemNames.get('fpi'),
    new GetMonths(
      new Date(items.get(commonItemNames.get('fpi')))
    ).getFirstDayOfMonth()
  );
  outputItems.set(
    commonItemNames.get('lpo'),
    new GetMonths(
      new Date(items.get(commonItemNames.get('lpo')))
    ).getLastDayOfMonth()
  );
  const trialType = items.get(commonItemNames.get('trialTypeItemName'));
  outputItems.set(
    commonItemNames.get('supportRangeItemName'),
    setSupportRangeText_(supportRange)
  );
  outputItems.set(
    'finalAnalysisCount',
    setFinalAnalysisCount_(trialTypeItemNames, trialType)
  );
  const supportRangeValues = setSupportRange_(supportRange);
  const defaultValues = setDefaultValues_(outputItems);
  const termValues = setTerms_(outputItems, trialTypeItemNames);
  [...supportRangeValues, ...defaultValues, ...termValues].forEach(
    ([key, value]) => outputItems.set(key, value)
  );
  outputItems.set('comments', editComments_(outputItems));
  return outputItems;
}
/**
 * Check if the trial type is in the target trial types.
 *
 * @param {Map} trialTypeItemNames - The map of trial type item names.
 * @param {string} trialType - The trial type identifier.
 * @param {Set} target - The target trial types.
 * @returns {boolean} Whether the trial type is in the target trial types.
 * @private
 */
function isTrialTypeInTarget_(trialTypeItemNames, trialType, target) {
  const targetArray = Array.from(target);
  return targetArray.map(x => trialTypeItemNames.get(x)).includes(trialType);
}
