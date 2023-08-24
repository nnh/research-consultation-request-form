/**
 * Creates a map of common item names with their translations.
 *
 * @returns {Map<string, string>} The map of item names and their translations.
 */
function createCommonItemNames_() {
  return new Map([
    ['facilitiesItemName', '施設数'],
    ['casesItemName', '目標症例数'],
    ['crfItemName', 'CRF項目数'],
    ['trialTypeItemName', '試験種別'],
    ['supportRangeItemName', '支援範囲'],
    ['fpi', 'FPI (First Patient In)'],
    ['lpo', 'LPO (Last Patient Out)'],
    ['treatmentTerm', '治療期間'],
    ['replyToEmailAddress', '返信先メールアドレス'],
  ]);
}
/**
 * Creates a map of trial type item names with their translations.
 *
 * @returns {Map<string, string>} The map of trial type item names and their translations.
 */
function createTrialTypeItemNamesMap_() {
  return new Map([
    ['investigatorInitiatedTrial', '医師主導治験'],
    ['specifiedClinicalTrial', '特定臨床研究'],
    ['interventionStudies', '介入研究（特定臨床研究以外）'],
    ['observationalStudiesAndRegistries', '観察研究・レジストリ'],
    ['advancedMedical', '先進'],
  ]);
}
/**
 * Formats a date object to a string representation using the specified format.
 *
 * @param {Date} date - The date object to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDateToString_(date) {
  const formattedDate = Utilities.formatDate(
    date,
    'Asia/Tokyo',
    'yyyy年M月d日'
  );
  return formattedDate;
}
/**
 * Converts fullwidth digits in a string to halfwidth digits.
 *
 * @param {string} str - The string to be converted.
 * @returns {string} The converted string with halfwidth digits.
 */
function convertFullwidthToHalfwidth_(str) {
  if (!str) {
    return;
  }
  const fullwidthDigits = [
    '０',
    '１',
    '２',
    '３',
    '４',
    '５',
    '６',
    '７',
    '８',
    '９',
  ];
  const halfwidthDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 0; i < fullwidthDigits.length; i++) {
    const regex = new RegExp(fullwidthDigits[i], 'g');
    str = str.replace(regex, halfwidthDigits[i]);
  }

  return str;
}
/**
 * Rounds the number of months to the nearest year.
 *
 * @param {number} months - The number of months.
 * @returns {number} The rounded number of years.
 */
function roundYear_(months) {
  const roundedUpMonth = 6;
  const tempYear = Math.trunc(months / 12);
  const tempMonth = months - tempYear * 12;
  return tempMonth >= roundedUpMonth ? tempYear + 1 : tempYear;
}
/**
 * Represents a utility class for working with months and dates.
 */
class GetMonths {
  /**
   * Constructs a new instance of the GetMonths class.
   *
   * @param {Date} date - The current date.
   */
  constructor(date) {
    this.currentDate = date;
    this.year = this.currentDate.getFullYear();
    this.month = this.currentDate.getMonth();
  }
  /**
   * Gets the date that is a specified number of months ago from the current date.
   *
   * @param {number} monthsAgo - The number of months ago.
   * @returns {Date} The target date.
   */
  getAgoDate(monthsAgo) {
    let targetMonth = this.month - monthsAgo;
    // Adjust the year and month if the target month is negative
    while (targetMonth < 0) {
      targetMonth += 12;
      this.year--;
    }
    const monthsAgoDate = new Date(this.year, targetMonth, 1);
    return monthsAgoDate;
  }
  /**
   * Gets the date that is a specified number of months in the future from the current date.
   *
   * @param {number} monthsFuture - The number of months in the future.
   * @returns {Date} The target date.
   */
  getFutureDate(monthsFuture) {
    let targetMonth = this.month + monthsFuture;
    let targetYear = this.year;
    if (targetMonth > 11) {
      targetYear += Math.floor(targetMonth / 12);
      targetMonth = targetMonth % 12;
    }
    const futureDate = new Date(targetYear, targetMonth + 1, 0);
    return futureDate;
  }
  /**
   * Gets the difference in months between the current date and the specified end date.
   *
   * @param {Date} endDate - The end date.
   * @returns {number} The number of months difference.
   */
  getMonthDiff(endDate) {
    const startYear = this.year;
    const startMonth = this.month;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    return monthDiff;
  }
  /**
   * Gets the first day of the current month.
   *
   * @returns {Date} The first day of the current month.
   */
  getFirstDayOfMonth() {
    return new Date(this.year, this.month, 1);
  }
  /**
   * Gets the last day of the current month.
   *
   * @returns {Date} The last day of the current month.
   */
  getLastDayOfMonth() {
    return new Date(this.year, this.month + 1, 0);
  }
}
/**
 * Represents a utility class for working with filters and hiding values in specific sheets.
 */
class FilterVisibleHidden {
  /**
   * Constructs a new instance of the FilterVisibleHidden class.
   *
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The spreadsheet object.
   * @param {string[]} targetSheetNames - The names of the target sheets.
   */
  constructor(ss, targetSheetNames) {
    this.ss = ss;
    this.sheets = this.ss
      .getSheets()
      .filter(x => targetSheetNames.some(v => x.getName() === v));
  }
  /**
   * Gets the filters applied in the target sheets.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Filter[]} The filters applied in the target sheets.
   */
  getFilters() {
    return this.sheets.map(sheet => sheet.getFilter()).filter(x => x);
  }
  /**
   * Removes the filter criteria from the target filter.
   *
   * @param {GoogleAppsScript.Spreadsheet.Filter} targetFilter - The target filter.
   */
  removeFilterCriteria(targetFilter) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.removeColumnFilterCriteria(col);
  }
  /**
   * Creates a new filter criteria object with hidden values set to '0'.
   *
   * @returns {GoogleAppsScript.Spreadsheet.FilterCriteria} The new filter criteria object.
   */
  createFilterCriteria() {
    const filterCriteria = SpreadsheetApp.newFilterCriteria();
    filterCriteria.setHiddenValues(['0']);
    return filterCriteria;
  }
  /**
   * Sets the filter criteria for the target filter.
   *
   * @param {GoogleAppsScript.Spreadsheet.Filter} targetFilter - The target filter.
   * @param {GoogleAppsScript.Spreadsheet.FilterCriteria} criteria - The filter criteria.
   */
  setFilterCriteria(targetFilter, criteria) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.setColumnFilterCriteria(col, criteria);
  }
  /**
   * Applies filter criteria to hide values in the target sheets.
   */
  filterHidden() {
    this.getFilters().forEach(filter => {
      this.removeFilterCriteria(filter);
      const criteria = this.createFilterCriteria();
      this.setFilterCriteria(filter, criteria);
    });
  }
}
/**
 * Filters and hides values in the target sheets of a spreadsheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - The spreadsheet object.
 * @param {string[]} targetSheetNames - The names of the target sheets.
 * @returns {Error | null} Returns an Error object if the filter hiding process fails, otherwise null.
 */
function filterHidden_(ss, targetSheetNames) {
  try {
    new FilterVisibleHidden(ss, targetSheetNames).filterHidden();
  } catch (error) {
    return new Error('Filter hiding process failed.');
  }
  return null;
}
/**
 * Checks if the provided object is an instance of the Error class.
 *
 * @param {any} obj - The object to check.
 * @returns {boolean} Returns true if the object is an instance of Error, otherwise false.
 */
function isErrorObject_(obj) {
  return utilsLibrary.isErrorObject(obj);
}
