---
title: RTF 轉 PDF
description: 使用以 LibreOffice 驅動的引擎，在瀏覽器中將 RTF（Rich Text Format）檔案轉換為 PDF。
---

# RTF 轉 PDF

將 RTF（Rich Text Format）文件轉換為 PDF。RTF 是幾乎所有文書處理軟體都支援的跨平台文件格式。此工具使用瀏覽器端的 LibreOffice 引擎轉譯 RTF 檔案並完整保留格式，粗體、斜體、表格與內嵌圖片都會帶到 PDF 中。

## 支援格式

| 格式 | 副檔名 | MIME 類型                     |
| :--- | :----- | :---------------------------- |
| RTF  | `.rtf` | `text/rtf`, `application/rtf` |

## 運作方式

1. 點擊上傳區域，或拖放一個或多個 RTF 檔案。
2. 檢查檔案清單，視需要新增或移除檔案。
3. 點擊 **轉換為 PDF**。LibreOffice 引擎會在首次使用時初始化，接著處理每個檔案。
4. 單一檔案會直接下載為 PDF。多個檔案會以 `rtf-converted.zip` 提供。

## 選項

此工具沒有其他設定。轉換會保留原始 RTF 格式。

## 輸出

| 輸入數量     | 輸出                                                  |
| :----------- | :---------------------------------------------------- |
| 1 個檔案     | 下載單一 PDF（例如 `letter.pdf`）                     |
| 2 個以上檔案 | ZIP 壓縮檔（`rtf-converted.zip`），每個檔案各一個 PDF |

## 使用情境

- 將舊式文書處理軟體的 RTF 文件轉換為現代 PDF
- 將 RTF 電子郵件範本轉為 PDF 預覽
- 處理法律或醫療軟體系統輸出的 RTF
- 將文件管理系統中的 RTF 檔案批次轉換為 PDF 以便封存

## 提示

- LibreOffice 引擎只會載入一次並加以快取。工作階段中的第一次轉換會多花幾秒，之後就會比較快。
- 含有內嵌 OLE 物件的 RTF 檔案可能無法完美轉譯所有物件。純文字、圖片與標準格式都能可靠地轉換。
- 如果您的 RTF 檔案是以 Microsoft Word 建立的，也可以直接使用 [Word 轉 PDF](./word-to-pdf) 工具轉換，它除了 DOC 與 DOCX 之外也接受 RTF。

## 相關工具

- [Word 轉 PDF](./word-to-pdf)
- [ODT 轉 PDF](./odt-to-pdf)
- [文字轉 PDF](./txt-to-pdf)
