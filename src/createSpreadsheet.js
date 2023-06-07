/**
 * Get a new spreadsheet by creating it from a template file.
 *
 * @returns {Array} An array containing the new spreadsheet and the output folder.
 */
function getNewSpreadSheet_() {
  const templateFile = getTemplateFile_();
  if (isErrorObject_(templateFile)) {
    return templateFile;
  }
  const outputFolder = getOutputFolder_();
  if (isErrorObject_(outputFolder)) {
    return outputFolder;
  }
  return [createNewSpreadsheet_(templateFile, outputFolder), outputFolder];
}
/**
 * Get the target sheets from a new spreadsheet based on the given sheet names.
 *
 * @param {Spreadsheet} newSpreadSheet - The new spreadsheet.
 * @param {Array} sheetNames - The names of the target sheets.
 * @returns {Map|Error} A map containing the target sheets, or an error if any of the required sheets do not exist.
 * @private
 */
function getTargetSheets_(newSpreadSheet, sheetNames) {
  const sheets = new Map();
  const errorCheckSheets = new Set();
  sheetNames.forEach(sheetName => {
    const sheet = newSpreadSheet.getSheetByName(sheetName);
    if (sheet === null) {
      errorCheckSheets.add(sheetName);
    }
    sheets.set(sheetName, sheet);
  });
  if (errorCheckSheets.size > 0) {
    const sheetNames = Array.from(errorCheckSheets).join(', ');
    return new Error(`${sheetNames} required for the template do not exist.`);
  }
  return sheets;
}
/**
 * Create a new spreadsheet using the input data.
 *
 * @param {Object|null} inputData - The input data for the spreadsheet.
 * @returns {Spreadsheet|Error} The new spreadsheet if successful, or an error object if any errors occur.
 */
function createSpreadsheet_(inputData = null) {
  const warnings = new Set();
  const [newSpreadSheet, outputFolder] = getNewSpreadSheet_();
  if (isErrorObject_(newSpreadSheet)) {
    return newSpreadSheet;
  }
  const sheetNames = ['Quotation Request', 'Trial', 'Setup', 'Quote', 'Total'];
  const sheets = getTargetSheets_(newSpreadSheet, sheetNames);
  const [quotationRequest, trial, targetYear, quote, total] = sheetNames;
  const visibleSheetNames = [quote, total];
  const yearValues = setYearSheetValues_(sheets.get(targetYear), inputData);
  if (isErrorObject_(yearValues)) {
    return yearValues;
  }
  const trialValues = setTrialSheetValues_(
    sheets.get(trial),
    inputData,
    targetYear
  );
  if (isErrorObject_(trialValues)) {
    return trialValues;
  }
  try {
    sheets.get(quotationRequest).getRange('A2').setValue('quote-generator-2');
  } catch (error) {
    return new Error(
      'An error occurred when outputting data to the spreadsheet.'
    );
  }
  warnings.add(hideSheets_(newSpreadSheet, visibleSheetNames));
  warnings.add(filterHidden_(newSpreadSheet, visibleSheetNames));
  warnings.add(insertAndOutputInputData_(newSpreadSheet, inputData));
  warnings.add(createPDFFromSpreadsheet_(newSpreadSheet, outputFolder));
  if (warnings.size > 1) {
    let message = Array.from(warnings, value => value.message).join(', ');
    return new Error(message);
  } else {
    return newSpreadSheet;
  }
}
/**
 * Get the template file from Google Drive.
 *
 * @returns {File|Error} The template file if found, or an error object if any errors occur.
 * @private
 */
function getTemplateFile_() {
  try {
    return DriveApp.getFileById(
      PropertiesService.getScriptProperties().getProperty('templateFileId')
    );
  } catch (error) {
    return error;
  }
}
/**
 * Get the output folder from Google Drive.
 *
 * @returns {Folder|Error} The output folder if found, or an error object if any errors occur.
 * @private
 */
function getOutputFolder_() {
  try {
    return DriveApp.getFolderById(
      PropertiesService.getScriptProperties().getProperty('outputFolderId')
    );
  } catch (error) {
    return error;
  }
}
/**
 * Create a new spreadsheet by making a copy of the template file in the output folder.
 *
 * @param {File} templateFile - The template file to be copied.
 * @param {Folder} outputFolder - The output folder where the new spreadsheet will be created.
 * @returns {Spreadsheet|Error} The new spreadsheet if successful, or an error object if any errors occur.
 * @private
 */
function createNewSpreadsheet_(templateFile, outputFolder) {
  try {
    const now = driveCommon.todayYyyymmdd();
    const newFile = templateFile.makeCopy(
      `研究相談用見積 ${now}`,
      outputFolder
    );
    return SpreadsheetApp.openById(newFile.getId());
  } catch (error) {
    return error;
  }
}
/**
 * Create a PDF file from the given spreadsheet and save it to the output folder.
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet to convert to PDF.
 * @param {Folder} outputFolder - The output folder where the PDF file will be saved.
 * @returns {null|Error} Null if successful, or an error object if PDF creation fails.
 * @private
 */
function createPDFFromSpreadsheet_(spreadsheet, outputFolder) {
  try {
    const blob = spreadsheet.getAs('application/pdf');
    outputFolder.createFile(blob);
  } catch (error) {
    return new Error('PDF creation failed.');
  }
  return null;
}
/**
 * Insert and output the input data to a new sheet in the spreadsheet.
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet where the input data will be inserted.
 * @param {Map} inputData - The input data to be inserted.
 * @returns {null|Error} Null if successful, or an error object if the process fails.
 * @private
 */
function insertAndOutputInputData_(spreadsheet, inputData) {
  try {
    const outputSheet = spreadsheet.insertSheet(0);
    const target = new Map();
    const commonItemNames = createCommonItemNames_();
    commonItemNames.forEach((value, _) =>
      target.set(value, inputData.get(value))
    );
    const data = Array.from(target);
    outputSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    outputSheet.setName('Input Data');
    outputSheet.setColumnWidths(1, outputSheet.getLastColumn(), 140);
  } catch (error) {
    return new Error('The process to output input data failed.');
  }
  return null;
}
/**
 * Hide sheets in the spreadsheet that are not included in the visibleSheets array.
 *
 * @param {Spreadsheet} spreadsheet - The spreadsheet containing the sheets to hide.
 * @param {string[]} visibleSheets - An array of sheet names that should remain visible.
 * @returns {null|Error} Null if successful, or an error object if hiding sheets fails.
 * @private
 */
function hideSheets_(spreadsheet, visibleSheets) {
  try {
    const sheets = spreadsheet.getSheets();
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      if (!visibleSheets.includes(sheetName)) {
        sheet.hideSheet();
      } else {
        sheet.setHiddenGridlines(true);
      }
    });
  } catch (error) {
    return new Error('Failed to hide sheets.');
  }
  return null;
}
