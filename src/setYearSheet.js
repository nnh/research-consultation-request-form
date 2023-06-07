/**
 * Set the values in the year sheet based on the input data.
 *
 * @param {Sheet} sheet - The year sheet to set the values in.
 * @param {Map} inputData - The input data containing the values for the year sheet.
 * @returns {Array[]} The updated year sheet values.
 * @private
 */
function setYearSheetValues_(sheet, inputData) {
  // Setup the number of calculations on the Setup sheet.
  const yearSheetIdx = new Map([
    ['headerCol', 2],
    ['bodyCol', 5],
  ]);
  const yearSheetHeaderAndValues = sheet.getDataRange().getValues();
  const setupValues = calculateSetupValues_(inputData);
  const setYearValues = yearSheetHeaderAndValues.map(values =>
    setupValues.has(values[yearSheetIdx.get('headerCol')])
      ? [setupValues.get(values[yearSheetIdx.get('headerCol')])]
      : ['']
  );
  sheet
    .getRange(1, yearSheetIdx.get('bodyCol') + 1, setYearValues.length, 1)
    .setValues(setYearValues);
  return setYearValues;
}
/**
 * Calculate the setup values for the year sheet based on the input data.
 *
 * @param {Map} inputData - The input data containing the values for the year sheet.
 * @returns {Map} The calculated setup values.
 * @private
 */
function calculateSetupValues_(inputData) {
  const commonItemNames = createCommonItemNames_();
  const setupValues = new Map();
  if (inputData.get('protocolDevelopmentSupport')) {
    setupValues.set(
      'プロトコルレビュー・作成支援（図表案、統計解析計画書案を含む）',
      1
    );
    setupValues.set('検討会実施（TV会議等）', 4);
  }
  if (
    inputData.get('clinicalTrialOffice') ||
    inputData.get('症例登録費/研究費') === 'あり'
  ) {
    setupValues.set('事務局運営（試験開始前）', inputData.get('setupMonths'));
    setupValues.set('SOP一式、CTR登録案、TMF管理', 1);
    setupValues.set(
      'IRB準備・承認確認',
      inputData.get(commonItemNames.get('facilitiesItemName'))
    );
    setupValues.set(
      '薬剤対応',
      inputData.get(commonItemNames.get('facilitiesItemName'))
    );
    setupValues.set(
      '事務局運営（試験開始後から試験終了まで）',
      inputData.get('fpiToLpo')
    );
    setupValues.set('事務局運営（試験終了時）', 1);
  }
  if (inputData.get('monitoring')) {
    const monitoringCount = 4;
    setupValues.set('モニタリング準備業務（関連資料作成）', 1);
    setupValues.set(
      '開始前モニタリング・必須文書確認',
      inputData.get(commonItemNames.get('facilitiesItemName'))
    );
    setupValues.set(
      '症例モニタリング・SAE対応',
      inputData.get('treatmentYears') *
        inputData.get(commonItemNames.get('casesItemName')) *
        monitoringCount
    );
  }
  if (inputData.get('datacenter')) {
    setupValues.set('データベース管理料', inputData.get('fpiToLpo'));
    setupValues.set('EDCライセンス・データベースセットアップ', 1);
    setupValues.set('業務分析・DM計画書の作成・CTR登録案の作成', 1);
    setupValues.set('DB作成・eCRF作成・バリデーション', 1);
    setupValues.set('バリデーション報告書', 1);
    setupValues.set(
      '初期アカウント設定（施設・ユーザー）、IRB承認確認',
      inputData.get(commonItemNames.get('facilitiesItemName'))
    );
    setupValues.set('入力の手引作成', 1);
    setupValues.set(
      'ロジカルチェック、マニュアルチェック、クエリ対応',
      inputData.get('fpiToLpo')
    );
    setupValues.set('データクリーニング', 1);
    setupValues.set('データベース固定作業、クロージング', 1);
  }
  if (inputData.get('statisticalAnalysis')) {
    setupValues.set(
      '統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成',
      1
    );
    setupValues.set(
      '最終解析プログラム作成、解析実施（シングル）',
      inputData.get('finalAnalysisCount')
    );
    setupValues.set('最終解析報告書作成（出力結果＋表紙）', 1);
  }
  if (inputData.get('csr')) {
    setupValues.set('研究結果報告書の作成', 1);
  }
  if (setupValues.size > 0) {
    setupValues.set('プロジェクト管理', inputData.get('totalMonths'));
  }
  return setupValues;
}
