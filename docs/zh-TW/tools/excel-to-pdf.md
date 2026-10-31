---
title: Excel 轉 PDF
description: 將 Excel 試算表（XLS、XLSX）、ODS 與 CSV 檔案轉換為 PDF，並保留格式。
---

# Excel 轉 PDF

將試算表檔案轉換為 PDF。此工具支援新版 Excel 檔案、舊版 XLS 格式、OpenDocument 試算表，甚至 CSV，全部透過瀏覽器內的 LibreOffice 引擎轉換，可保留儲存格格式、公式（以計算後的值呈現）、圖表與多工作表版面。

## 支援格式

| 格式                | 副檔名  |
| :------------------ | :------ |
| Excel（新版）       | `.xlsx` |
| Excel（舊版）       | `.xls`  |
| OpenDocument 試算表 | `.ods`  |
| CSV                 | `.csv`  |

## 運作方式

1. 點擊上傳區域，或拖放您的試算表檔案。
2. 檢查檔案清單。新增更多檔案或移除不需要的檔案。
3. 點擊 **轉換為 PDF**。LibreOffice 引擎會在首次使用時初始化，然後處理每個檔案。
4. 單一檔案會直接下載為 PDF。多個檔案會以 `excel-converted.zip` 提供。

## 選項

此工具沒有額外設定。LibreOffice 引擎會依據試算表內建的設定決定頁面版面、縮放比例與列印範圍。

## 輸出

| 輸入數量     | 輸出                                                    |
| :----------- | :------------------------------------------------------ |
| 1 個檔案     | 單一 PDF 下載（原始檔名加上 `.pdf` 副檔名）             |
| 2 個以上檔案 | ZIP 封存檔（`excel-converted.zip`），每個檔案各一個 PDF |

## 使用情境

- 將 Excel 中的財務報表或預算轉換為 PDF 以便發布
- 從庫存或產品型錄試算表建立可直接列印的 PDF
- 與未安裝 Excel 的利害關係人分享資料分析結果
- 以不可編輯的格式封存季度報告
- 將 LibreOffice Calc 的 ODS 檔案轉換為 PDF

## 提示

- 試算表中內嵌的圖表會呈現在 PDF 中。轉換前請確認它們在原始檔案中顯示正確。
- 如果試算表有多個工作表，所有工作表都會包含在 PDF 輸出中。
- 對於沒有格式的簡單 CSV 資料，[CSV 轉 PDF](./csv-to-pdf) 工具提供更輕量的轉換。需要保留格式、圖表或多個工作表時，請使用 Excel 轉 PDF。

## 相關工具

- [CSV 轉 PDF](./csv-to-pdf)
- [Word 轉 PDF](./word-to-pdf)
- [PowerPoint 轉 PDF](./powerpoint-to-pdf)
