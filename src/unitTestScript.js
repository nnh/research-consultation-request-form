/**
 * Creates a deep copy of a Map object.
 * @param {Map} originalMap - The original Map object to be copied.
 * @returns {Map} - The deep copy of the original Map object.
 */
function deepCopyMap_(originalMap) {
  const newMap = new Map();
  originalMap.forEach((value, key) => {
    if (typeof value === 'object' && value !== null) {
      newMap.set(key, deepCopyMap_(value));
    } else {
      newMap.set(key, value);
    }
  });
  return newMap;
}
/**
 * Creates base test data based on the trial type and fee applicability.
 * @param {string} trialType - The trial type.
 * @param {boolean} isFeeApplicable - Indicates if the fee is applicable.
 * @returns {Array} - An array of test data with edited input items.
 */
function createBaseTestData_(trialType, isFeeApplicable) {
  const testData = new Map();
  const trialTypeMap = createTrialTypeItemNamesMap_();
  testData.set('試験種別', trialType);
  testData.set('症例登録費/研究費', isFeeApplicable ? 'あり' : 'なし');
  if (
    trialType === trialTypeMap.get('investigatorInitiatedTrial') ||
    trialType === trialTypeMap.get('advancedMedical')
  ) {
    testData.set('目標症例数', 222);
    testData.set('治療期間', '13');
    testData.set('monthsOfTreatment', 13);
  }
  if (
    trialType === trialTypeMap.get('investigatorInitiatedTrial') ||
    trialType === trialTypeMap.get('advancedMedical') ||
    isFeeApplicable
  ) {
    testData.set('施設数', 44);
  }
  const fpiAndLpo = generateCombinedFpiAndLpo_();
  const testDataList = fpiAndLpo.map(([fpi, lpo, months]) => {
    const newtestData = deepCopyMap_(testData);
    newtestData.set('FPI (First Patient In)', fpi);
    newtestData.set('LPO (Last Patient Out)', lpo);
    newtestData.set('fpiToLpoMonth', months);
    return newtestData;
  });
  const testEditItems = testDataList.map(testData => editInputItems_(testData));
  return testEditItems;
}
/**
 * Generates combinations of FPI (First Patient In) and LPO (Last Patient Out) dates,
 * and associates them with a duration of 12 months.
 * @returns {Array} - An array of combinations of FPI, LPO, and duration.
 */
function generateCombinedFpiAndLpo_() {
  const fpi = ['2023-01-01', '2023-01-15', '2023-01-31'];
  const lpo = ['2025-12-01', '2025-12-15', '2025-12-31'];
  const combinedDates = createCombinations_(fpi, lpo);
  return combinedDates.map(dateCombination => [...dateCombination, 12]);
}
/**
 * Creates combinations of elements from two arrays.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} - An array of combinations.
 */
function createCombinations_(arr1, arr2) {
  const combinations = [];

  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      combinations.push([arr1[i], arr2[j]]);
    }
  }

  return combinations;
}
/**
 * Class representing test edit input items.
 */
class TestEditInputItems {
  /**
   * Create a TestEditInputItems.
   */
  constructor() {
    this.propertiesMap = new Map([
      ['プロトコル作成支援', 'protocolDevelopmentSupport'],
      ['調整事務局', 'clinicalTrialOffice'],
      ['データセンター', 'datacenter'],
      ['実地モニタリング', 'monitoring'],
      ['統計解析', 'statisticalAnalysis'],
      ['CSR作成', 'csr'],
    ]);
    const propertiesKeys = [...this.propertiesMap.keys()];
    this.scopeOfSupportMap = new Map([
      ['医師主導治験', propertiesKeys],
      [
        '特定臨床研究',
        ['プロトコル作成支援', 'データセンター', '統計解析', 'CSR作成'],
      ],
      [
        '介入研究（特定臨床研究以外）',
        ['プロトコル作成支援', 'データセンター', '統計解析'],
      ],
      [
        '観察研究・レジストリ',
        ['プロトコル作成支援', 'データセンター', '統計解析'],
      ],
      ['先進', propertiesKeys],
    ]);
    this.scopeOfSupport = new Map();
    this.scopeOfSupportMap.forEach((value, key) => {
      const supportMap = propertiesKeys.map(formText => [
        this.propertiesMap.get(formText),
        value.includes(formText),
      ]);
      this.scopeOfSupport.set(key, new Map(supportMap));
    });
    this.trialMapInvestigatorInitiatedTrial = new Map([
      ['CRF項目数', 3500],
      ['施設数', null],
      ['目標症例数', 222],
      ['係数', 1],
    ]);
    this.trialMapOthers = new Map([
      ['CRF項目数', 3500],
      ['施設数', null],
      ['目標症例数', 50],
      ['係数', 1],
    ]);
    this.trialTypeMap = createTrialTypeItemNamesMap_();
    this.commonItemNames = createCommonItemNames_();
  }
  /**
   * Creates test data based on the trial type.
   * @param {string} trialType - The trial type.
   * @returns {Array} - An array of test data.
   */
  createTestData(trialType = null) {
    const testData1 = createBaseTestData_(trialType, true);
    const testData2 = createBaseTestData_(trialType, false);
    return [...testData1, ...testData2];
  }
  /**
   * Tests the scope of support for the test data.
   * @param {Map} testData - The test data.
   * @returns {Set|null} - A set of errors or null if the test passes.
   */
  testScopeOfSupport(testData) {
    const supportMap = this.scopeOfSupport.get(
      testData.get(this.commonItemNames.get('trialTypeItemName'))
    );
    return this.testTargetValues(testData, supportMap);
  }
  /**
   * Tests the target values for the test data.
   * @param {Map} testData - The test data.
   * @param {Map} targetMap - The target values map.
   * @returns {Set|null} - A set of errors or null if the test passes.
   */
  testTargetValues(testData, targetMap) {
    const flag = new Set();
    targetMap.forEach((value, key) => {
      const result =
        testData.get(key) === value
          ? true
          : new Error(`Error_${key}_${testData.get(key)}_${value}`);
      flag.add(result);
    });
    const checkData = flag.size > 1 ? flag : null;
    return checkData;
  }
  /**
   * Tests the trial values for the test data.
   * @param {Map} testData - The test data.
   * @returns {Set|null} - A set of errors or null if the test passes.
   */
  testTrialValues(testData) {
    const trialMap =
      testData.get(this.commonItemNames.get('trialTypeItemName')) ===
        this.trialTypeMap.get('investigatorInitiatedTrial') ||
      testData.get(this.commonItemNames.get('trialTypeItemName')) ===
        this.trialTypeMap.get('advancedMedical')
        ? this.trialMapInvestigatorInitiatedTrial
        : this.trialMapOthers;
    if (
      testData.get(this.commonItemNames.get('trialTypeItemName')) ===
        this.trialTypeMap.get('investigatorInitiatedTrial') ||
      testData.get(this.commonItemNames.get('trialTypeItemName')) ===
        this.trialTypeMap.get('advancedMedical') ||
      testData.get('症例登録費/研究費') === 'あり'
    ) {
      trialMap.set('施設数', 44);
    } else {
      trialMap.set('施設数', 10);
    }
    const trialValues = prepareTrialSheetValues_(testData, 'Setup');
    return this.testTargetValues(trialValues, trialMap);
  }
  /**
   * Gets the list of test data.
   * @returns {Array} - An array of test data.
   */
  getTestDataList() {
    const targetTrialTypes = [...this.trialTypeMap.values()];
    const testDataList = targetTrialTypes.flatMap(trialType =>
      this.createTestData(trialType)
    );
    return testDataList;
  }
}
/**
 * Runs the data checks and logs the result.
 */
function runDataChecksExec() {
  const res = runDataChecks_();
  if (res === null) {
    console.log('All items checked.');
  } else {
    console.log(`Unchecked items: ${res}`);
  }
}
/**
 * Runs the data checks for the test data list.
 * @returns {string[]|null} - Array of unchecked items if there are any, otherwise null.
 */
function runDataChecks_() {
  const testEditInputItems = new TestEditInputItems();
  const testDataList = testEditInputItems.getTestDataList();
  /**
   * Result of scope of support check for each test data.
   * @type {(Error[]|null)[]}
   */
  const checkScopeOfSupport = testDataList.map(testData =>
    testEditInputItems.testScopeOfSupport(testData)
  );
  if (checkScopeOfSupport.some(result => result !== null)) {
    return checkScopeOfSupport;
  }
  /**
   * Result of trial values check for each test data.
   * @type {(Error[]|null)[]}
   */
  const checkTrialValues = testDataList.map(testData =>
    testEditInputItems.testTrialValues(testData)
  );
  if (checkTrialValues.some(result => result !== null)) {
    return checkTrialValues;
  }
  return null;
}
/**
 * Retrieves the target test data from the test data list based on a key-value pair.
 * @param {Map[]} testDataList - The list of test data.
 * @param {string} key - The key to match.
 * @param {*} value - The value to match.
 * @returns {Map[]} - The filtered test data list.
 */
function getTargetTestData_(testDataList, key, value) {
  return testDataList.filter(testData => testData.get(key) === value);
}
/**
 * Calculates the total amount for specific items and checks if they match the expected amount.
 */
function getTotalAmount() {
  const testEditInputItems = new TestEditInputItems();
  const testDataList = testEditInputItems.getTestDataList();
  // 観察研究・レジストリで症例登録費/研究費なし
  const itemsAndAmountList = [
    [
      new Map([
        ['試験種別', '観察研究・レジストリ'],
        ['症例登録費/研究費', 'なし'],
      ]),
      22482900,
    ],
    [
      new Map([
        ['試験種別', '観察研究・レジストリ'],
        ['症例登録費/研究費', 'あり'],
      ]),
      33952600,
    ],
    [
      new Map([
        ['試験種別', '特定臨床研究'],
        ['症例登録費/研究費', 'なし'],
      ]),
      35600400,
    ],
    [
      new Map([
        ['試験種別', '特定臨床研究'],
        ['症例登録費/研究費', 'あり'],
      ]),
      47713600,
    ],
    [
      new Map([
        ['試験種別', '介入研究（特定臨床研究以外）'],
        ['症例登録費/研究費', 'なし'],
      ]),
      27968600,
    ],
    [
      new Map([
        ['試験種別', '介入研究（特定臨床研究以外）'],
        ['症例登録費/研究費', 'あり'],
      ]),
      40081800,
    ],
    [
      new Map([
        ['試験種別', '医師主導治験'],
        ['症例登録費/研究費', 'なし'],
        ['治療期間', '13'],
      ]),
      334625500,
    ],
    [
      new Map([
        ['試験種別', '医師主導治験'],
        ['症例登録費/研究費', 'あり'],
        ['治療期間', '13'],
      ]),
      334625500,
    ],
    [
      new Map([
        ['試験種別', '先進'],
        ['症例登録費/研究費', 'なし'],
        ['治療期間', '13'],
      ]),
      334625500,
    ],
    [
      new Map([
        ['試験種別', '先進'],
        ['症例登録費/研究費', 'あり'],
        ['治療期間', '13'],
      ]),
      334625500,
    ],
  ];
  const checkTotalAmount = itemsAndAmountList.map(([items, amount]) => {
    let table = [...testDataList];
    items.forEach((value, key) => {
      table = getTargetTestData_(table, key, value);
    });
    if (table.length > 0) {
      const [createSpreadsheetRes, _pdf] = createSpreadsheet_(table[0]);
      const spreadsheet = SpreadsheetApp.openById(createSpreadsheetRes.getId());
      const sheet = spreadsheet.getSheetByName('Quote');
      const value = sheet.getRange('D30').getValue();
      return [items, value === amount];
    } else {
      return null;
    }
  });
  const uncheckedItems = checkTotalAmount.filter(([_, flag]) => !flag);
  if (uncheckedItems.length > 0) {
    uncheckedItems.forEach(([items, _]) =>
      console.log(`Unchecked items: ${items}`)
    );
    return;
  }
  console.log('All items checked.');
}
