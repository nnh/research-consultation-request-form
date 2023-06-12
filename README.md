# research-consultation-request-form
## 概要
研究相談用見積フォームに入力された情報から概算見積のスプレッドシートを作成するスクリプトです。  
## 参照設定
### ライブラリ
下記ライブラリを設定してください。  
nnh/quote-generator-2  
https://github.com/nnh/quote-generator-2  
nnh/driveCommon  
https://github.com/nnh/driveCommon  
nnh/spreadSheetBatchUpdate  
https://github.com/nnh/spreadSheetBatchUpdate  
### サービス
Google Sheets APIサービスを設定してください。  
### appsscript.json
```
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "quotegenerator2",
        "version": "0",
        "libraryId": "ライブラリID",
        "developmentMode": true
      },
      {
        "userSymbol": "driveCommon",
        "version": "0",
        "libraryId": "ライブラリID",
        "developmentMode": true
      },
      {
        "userSymbol": "spreadSheetBatchUpdate",
        "version": "0",
        "libraryId": "ライブラリID",
        "developmentMode": true
      }
    ],
    "enabledAdvancedServices": [
      {
        "userSymbol": "Sheets",
        "version": "v4",
        "serviceId": "sheets"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```
### スクリプトプロパティ
- administratorEmailAddress  
（未使用）エラー情報送信先のメールアドレスを設定してください。  
- outputFolderId  
スプレッドシートを出力するフォルダのIDを設定してください。  
- templateFileId  
テンプレートとなるスプレッドシートのファイルのIDを設定してください。  
