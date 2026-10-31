---
title: PDF 轉 Markdown
description: 將 PDF 文件轉換為 Markdown 格式，可選擇擷取圖片。支援多個檔案批次轉換。
---

# PDF 轉 Markdown

將 PDF 檔案轉換為 Markdown（`.md`）格式，保留標題、段落、清單與基本格式。可選擇擷取並納入內嵌圖片。支援單一與批次轉換。由 PyMuPDF 驅動。

## 運作方式

1. 點選拖放區或將檔案拖曳到其中，上傳一個或多個 PDF。
2. 可選擇開啟**包含圖片**，將擷取的圖片嵌入 Markdown 輸出。
3. 點選**轉換**開始處理。
4. 單一檔案會下載為 `filename.md`。多個檔案會產生 `markdown-files.zip`。

## 選項

- **包含圖片**：勾選時，會擷取 PDF 中的內嵌圖片並在 Markdown 輸出中參照。未勾選時，只轉換文字內容。

## 輸出格式

- **單一檔案**：`filename.md`
- **多個檔案**：`markdown-files.zip`，每個輸入 PDF 各有一個 `.md`。

## 使用情境

- 將 PDF 文件轉換為 Markdown，用於 VitePress、Hugo 或 Jekyll 等靜態網站產生器。
- 將 PDF 研究論文轉成可編輯的 Markdown，用於 Obsidian 等筆記應用程式。
- 將舊有的 PDF 知識庫移轉為適合 Git 的文字格式。
- 從 PDF 電子書擷取結構化內容以重新排版。

## 小技巧

- 當 PDF 包含對內容不可或缺的圖表或插圖時，包含圖片選項很有用。以文字為主的文件請停用此選項，讓輸出保持簡潔。
- 含有側欄、註腳或多欄文字的複雜版面可能產生不完美的 Markdown。請視需要檢查並調整輸出。
- 若要不含任何格式的原始文字，請改用 [PDF 轉文字](./pdf-to-text)。

## 相關工具

- [PDF 轉文字](./pdf-to-text)
- [PDF 轉 Word](./pdf-to-word)
- [為 AI 準備 PDF](./prepare-pdf-for-ai)
