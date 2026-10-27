---
title: ODT 轉 PDF
description: 使用以 LibreOffice 驅動的引擎，在瀏覽器中將 OpenDocument 文字（ODT）檔案轉換為 PDF 格式。
---

# ODT 轉 PDF

將 OpenDocument 文字檔案轉換為 PDF。ODT 是 LibreOffice Writer、Apache OpenOffice 及其他開源文書處理器的原生格式。此工具使用瀏覽器端的 LibreOffice 引擎，產生能保留格式、表格、圖片與樣式的精確轉換結果。

## 支援格式

| 格式              | 副檔名 |
| :---------------- | :----- |
| OpenDocument 文字 | `.odt` |

## 運作方式

1. 點選上傳區域，或拖放一個或多個 ODT 檔案。
2. 檢查檔案清單。可新增更多檔案或移除不需要的檔案。
3. 點選**轉換為 PDF**。LibreOffice 引擎會先初始化（進度指示器會顯示載入狀態），接著逐一轉換每個檔案。
4. 單一檔案會直接下載為 PDF。多個檔案會打包成 `odt-converted.zip`。

## 選項

此工具沒有其他設定。轉換會盡可能保留原始文件的格式。

## 輸出

| 輸入數量     | 輸出                                                      |
| :----------- | :-------------------------------------------------------- |
| 1 個檔案     | 單一 PDF 下載（例如 `document.pdf`）                      |
| 2 個以上檔案 | ZIP 壓縮檔（`odt-converted.zip`），每個檔案各對應一份 PDF |

## 使用情境

- 將 LibreOffice Writer 文件轉換為 PDF，分享給 Microsoft Office 使用者
- 從以 OpenDocument 格式撰寫的學術論文產生可供列印的 PDF
- 將整個資料夾的 ODT 範本批次轉換為 PDF 以便發送
- 從自動化文件產生系統建立的 ODT 檔案產生 PDF

## 小技巧

- LibreOffice 引擎會在第一次使用時載入，並快取供後續轉換使用。初次載入需要幾秒鐘，之後的轉換就會很快。
- 含有內嵌 OLE 物件或特殊字型的複雜文件，呈現結果可能與桌面版 LibreOffice 略有不同。批次轉換前請先用範例測試。
- Word 文件（`.doc`、`.docx`）請改用 [Word 轉 PDF](./word-to-pdf) 工具，它同樣使用 LibreOffice 引擎，但可直接接受 Microsoft 格式。

## 相關工具

- [Word 轉 PDF](./word-to-pdf)
- [RTF 轉 PDF](./rtf-to-pdf)
- [文字轉 PDF](./txt-to-pdf)
