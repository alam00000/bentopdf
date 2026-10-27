---
title: PowerPoint 轉 PDF
description: 將 PowerPoint 簡報（PPT、PPTX）與 ODP 檔案轉換為 PDF，並保留投影片格式。
---

# PowerPoint 轉 PDF

將簡報檔案轉換為 PDF。每張投影片都會成為輸出文件中的一頁，文字、圖片、圖形與轉場效果皆透過瀏覽器端的 LibreOffice 引擎轉譯。支援新版與舊版 PowerPoint 格式，以及 OpenDocument 簡報格式。

## 支援格式

| 格式               | 副檔名  |
| :----------------- | :------ |
| PowerPoint（新版） | `.pptx` |
| PowerPoint（舊版） | `.ppt`  |
| OpenDocument 簡報  | `.odp`  |

## 運作方式

1. 點擊上傳區域，或將簡報檔案拖放到該處。
2. 檢查檔案清單，視需要新增或移除檔案。
3. 點擊 **轉換為 PDF**。LibreOffice 引擎會在首次使用時載入，接著轉換每個檔案。
4. 單一檔案會直接下載為 PDF。多個檔案會打包成 `powerpoint-converted.zip`。

## 選項

此工具沒有其他設定。投影片會以原始尺寸轉譯。

## 輸出

| 輸入數量     | 輸出                                                         |
| :----------- | :----------------------------------------------------------- |
| 1 個檔案     | 下載單一 PDF（原始檔名，副檔名為 `.pdf`）                    |
| 2 個以上檔案 | ZIP 壓縮檔（`powerpoint-converted.zip`），每個檔案各一個 PDF |

## 使用情境

- 在分享給可能沒有 PowerPoint 的觀眾之前，先將簡報轉換為 PDF
- 為研討會或工作坊製作可列印的投影片講義
- 以在所有裝置上都能一致呈現的格式封存簡報
- 將 LibreOffice Impress 的 ODP 簡報批次轉換為 PDF
- 製作 PDF 版的募資簡報，作為電子郵件附件

## 提示

- 投影片動畫與轉場效果不會呈現在 PDF 中。每張投影片都會擷取為靜態頁面。
- 內嵌影片不會出現在輸出中。如有需要，請改用螢幕截圖或預留位置圖片。
- 預設的 PDF 匯出不包含演講者備忘稿。如需備忘稿，建議先從 PowerPoint 原生的「列印備忘稿」檢視匯出。
- LibreOffice 引擎在首次載入後會被快取，因此在同一工作階段中轉換第二份簡報會快很多。

## 相關工具

- [Word 轉 PDF](./word-to-pdf)
- [Excel 轉 PDF](./excel-to-pdf)
- [圖片轉 PDF](./image-to-pdf)
