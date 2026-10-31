---
title: PDF 轉 JSON
description: 使用 CPDF 將 PDF 檔案轉換為結構化 JSON 格式。將 PDF 內部結構匯出為機器可讀的 JSON 資料。
---

# PDF 轉 JSON

將一個或多個 PDF 檔案轉換為 JSON 格式。工具使用 CPDF（Coherent PDF）將每個 PDF 的內部結構序列化為機器可讀的 JSON 表示。輸出一律以 ZIP 壓縮檔提供。

## 運作方式

1. 使用檔案選擇器選取一個或多個 PDF 檔案。
2. 點選**轉換**開始處理。轉換會在背景 Web Worker 中執行。
3. 下載 ZIP 壓縮檔，其中每個輸入 PDF 各有一個 JSON 檔案。

狀態列會顯示轉換與 ZIP 建立階段的進度。

## 選項

此工具沒有可設定的選項。每個 PDF 都會轉換為完整的 JSON 表示。

## 輸出格式

- `pdfs-to-json.zip` 檔案，每個輸入 PDF 各對應一個 `filename.json`。

JSON 輸出呈現 PDF 的內部物件結構，包括頁面樹、字型參照、中繼資料與內容串流。

## 使用情境

- 檢查 PDF 的內部結構以進行除錯或驗證。
- 以程式方式擷取結構化中繼資料與頁面屬性。
- 將 PDF 結構資料輸入自訂處理管線。
- 分析 PDF 文件的物件樹以稽核其合規性。

## 小技巧

- 此工具輸出的是原始 PDF 物件結構，而非擷取的文字內容。若需要 JSON 格式的頁面文字，請改用 [為 AI 準備 PDF](./prepare-pdf-for-ai)。
- 若只要擷取純文字，[PDF 轉文字](./pdf-to-text) 更為直接。
- 結構複雜的大型 PDF 會產生非常大的 JSON 檔案。

## 相關工具

- [PDF 轉文字](./pdf-to-text)
- [為 AI 準備 PDF](./prepare-pdf-for-ai)
- [擷取 PDF 表格](./extract-tables)
