---
title: PDF 轉 Word
description: 將 PDF 檔案轉換為可編輯的 Word（DOCX）文件。支援一次批次轉換多個 PDF。
---

# PDF 轉 Word

將 PDF 檔案轉換為可編輯的 Word（`.docx`）文件。工具使用 PyMuPDF 重建文件內容，保留文字、基本格式與版面。支援單一與批次轉換。

## 運作方式

1. 點選拖放區或將檔案拖曳到其中，上傳一個或多個 PDF。您可以新增更多檔案，或從清單中移除個別檔案。
2. 點選**轉換**開始處理。
3. 單一檔案會下載為 `filename.docx`。多個檔案會打包成 `converted-documents.zip`。

## 選項

此工具沒有可設定的選項。每個 PDF 都會使用 PyMuPDF 內建的轉換引擎轉換為 DOCX。

## 輸出格式

- **單一檔案**：`filename.docx`
- **多個檔案**：`converted-documents.zip`，每個輸入 PDF 各有一個 `.docx`。

## 使用情境

- 編輯收到後需要修改的 PDF 中的文字。
- 將封存的 PDF 報告轉換為同事能在 Microsoft Word 或 Google 文件中編輯的格式。
- 將 PDF 合約或提案的內容匯入 Word 以進行修訂標記。
- 將舊有的 PDF 文件移轉為可編輯的格式。

## 小技巧

- 含有多欄文字、內嵌表單或大量圖形的複雜版面可能無法完美轉換。請檢查輸出，並在文書處理器中調整格式。
- 掃描的 PDF（僅含圖片）會產生空白或內容極少的 DOCX 檔案。請先執行 OCR 加入文字層。
- 批次模式能有效率地轉換整個資料夾的 PDF，一次全部上傳即可。

## 相關工具

- [PDF 轉文字](./pdf-to-text)
- [PDF 轉 Markdown](./pdf-to-markdown)
- [PDF 工作流程建構器](./pdf-workflow)
