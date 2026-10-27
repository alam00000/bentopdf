---
title: PDF 轉 SVG
description: 將 PDF 頁面轉換為可縮放的 SVG 向量圖形。將文字與形狀保留為向量路徑，可無限縮放。
---

# PDF 轉 SVG

將 PDF 的每一頁轉換為 SVG（可縮放向量圖形）檔案。與點陣格式不同，SVG 會保留向量路徑、文字與形狀，因此輸出可縮放到任何大小而不會出現像素化。由 PyMuPDF 驅動。

## 運作方式

1. 點選拖放區或將檔案拖曳到其中，上傳一個或多個 PDF。您可以新增多個檔案並個別管理。
2. 點選**轉換**處理所有上傳的檔案。
3. 單一檔案且只有一頁時，會下載為獨立的 `.svg`。其他情況則下載為 ZIP 壓縮檔。

## 選項

此工具沒有可設定的選項。每一頁都會使用 PyMuPDF 的原生向量匯出轉換為 SVG。

## 輸出格式

- **單一檔案、單頁**：`filename.svg`
- **單一檔案、多頁**：`filename_svg.zip`，內含 `page_1.svg`、`page_2.svg` 等
- **多個檔案**：`pdf_to_svg.zip`，檔案依來源文件名稱整理。

## 使用情境

- 從 PDF 報告擷取向量圖表或插圖，用於網頁。
- 在 Inkscape 或 Illustrator 等向量編輯器中編輯 PDF 頁面內容。
- 在響應式網頁應用程式中嵌入可縮放的頁面預覽。
- 從 PDF 型錄擷取標誌或圖形，同時保留銳利邊緣。

## 小技巧

- SVG 最適合含有向量內容的 PDF。掃描文件或以圖片為主的 PDF 會產生內嵌點陣資料的大型 SVG 檔案。
- 以圖片為主的 PDF 若要點陣輸出，請改用 [PDF 轉 PNG](./pdf-to-png) 或 [PDF 轉 JPG](./pdf-to-jpg)。
- 此工具支援批次轉換，一次上傳多個 PDF 即可在單次執行中全部轉換。

## 相關工具

- [PDF 轉 PNG](./pdf-to-png)
- [PDF 轉 JPG](./pdf-to-jpg)
- [PDF 轉 Markdown](./pdf-to-markdown)
