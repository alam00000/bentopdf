---
title: Word 轉 PDF
description: 在瀏覽器中將 Word 文件（DOC、DOCX）、ODT 與 RTF 檔案轉換為 PDF，完整保留格式。
---

# Word 轉 PDF

將 Microsoft Word 文件及相容格式轉換為 PDF。此工具使用在瀏覽器中執行的 LibreOffice 引擎，可處理 DOC、DOCX、ODT 與 RTF 檔案，並在輸出中保留格式、表格、圖片、頁首、頁尾與樣式。

## 支援的格式

| 格式              | 副檔名  |
| :---------------- | :------ |
| Word（新版）      | `.docx` |
| Word（舊版）      | `.doc`  |
| OpenDocument 文字 | `.odt`  |
| RTF 格式          | `.rtf`  |

## 運作方式

1. 點選上傳區域，或拖放您的 Word 文件。可一次選取多個檔案。
2. 檢閱並管理檔案清單。
3. 點選**轉換為 PDF**。LibreOffice 引擎會在第一次使用時載入（進度指示器會顯示初始化狀態），接著逐一轉換每個檔案。
4. 單一檔案會直接下載為 PDF。多個檔案會打包成 `word-converted.zip`。

## 選項

此工具沒有其他設定。LibreOffice 引擎會使用其預設的 PDF 匯出設定檔產生輸出。

## 輸出

| 輸入數量 | 輸出                                                     |
| :------- | :------------------------------------------------------- |
| 1 個檔案 | 下載單一 PDF（原始檔名加上 `.pdf` 副檔名）               |
| 2 個以上 | ZIP 壓縮檔（`word-converted.zip`），每個檔案對應一個 PDF |

## 使用情境

- 在投遞求職申請前，將 DOCX 格式的履歷或求職信轉換為 PDF
- 批次將一組合約或提案轉換為 PDF 以交付客戶
- 將舊版 `.doc` 檔案轉換為新式 PDF 以便長期封存
- 將 Google Docs 的協作文件（匯出為 DOCX）轉換為 PDF
- 從自動化文件產生所使用的 Word 範本製作可供列印的 PDF

## 提示

- LibreOffice 引擎在每個工作階段只會下載一次並快取。第一次轉換需要幾秒鐘載入，之後的轉換會快得多。
- 複雜的格式（巨集、ActiveX 控制項、進階 SmartArt）可能無法完美轉換。標準文件元素（文字、表格、圖片、頁首、註腳）都能可靠地轉換。
- 由於此工具也接受 ODT 與 RTF，您可以把它當作所有文書處理格式的一站式轉換器。

## 相關工具

- [ODT 轉 PDF](./odt-to-pdf)
- [RTF 轉 PDF](./rtf-to-pdf)
- [Excel 轉 PDF](./excel-to-pdf)
- [PowerPoint 轉 PDF](./powerpoint-to-pdf)
