---
title: PDF 轉 TIFF
description: 將 PDF 頁面轉換為 TIFF 圖片，常用於印刷、傳真與封存工作流程。編碼失敗時會改用 PNG。
---

# PDF 轉 TIFF

將 PDF 的每一頁轉換為 TIFF 圖片。TIFF 是印刷製作、傳真系統與文件封存的標準格式。工具使用 PackBits 壓縮進行 TIFF 編碼，若某頁編碼失敗則改用 PNG。

## 運作方式

1. 點選拖放區或將檔案拖曳到其中，上傳 PDF。
2. 點選**轉換**處理檔案。
3. 單一 TIFF 檔案或 ZIP 壓縮檔會自動下載。

## 選項

此工具沒有可設定的選項。頁面以固定的 2 倍比例算繪。

## 輸出格式

- **單頁**：`filename.tiff`
- **多頁**：`filename_tiffs.zip`，內含 `page_1.tiff`、`page_2.tiff` 等

如果某一頁的 TIFF 編碼失敗（因壓縮問題），該頁會改存為 `.png` 檔案。此時 ZIP 中會同時包含 TIFF 與 PNG 檔案。

## 使用情境

- 向要求 TIFF 格式的政府機關或法律系統提交文件。
- 準備透過數位傳真服務傳送的頁面。
- 以廣泛支援的無損格式封存掃描文件。
- 將頁面匯入企業文件管理系統。

## 小技巧

- TIFF 檔案很大。如果只需要用於網頁或螢幕的無損品質，[PDF 轉 PNG](./pdf-to-png) 是更好的選擇。
- 如果有頁面需要改用 PNG，請檢查 ZIP 內容，您可能會想另外轉換這些頁面。

## 相關工具

- [PDF 轉 PNG](./pdf-to-png)
- [PDF 轉 BMP](./pdf-to-bmp)
- [PDF 轉 JPG](./pdf-to-jpg)
