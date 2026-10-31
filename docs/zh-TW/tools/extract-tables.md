---
title: 擷取 PDF 表格
description: 偵測並擷取 PDF 文件中的表格。可逐一表格匯出為 CSV、JSON 或 Markdown。
---

# 擷取 PDF 表格

偵測 PDF 中的所有表格，並讓您以所選格式匯出：CSV、JSON 或 Markdown。每個表格都會個別擷取，並附上頁面與位置中繼資料。由 PyMuPDF 的表格偵測引擎驅動。

## 運作方式

1. 點擊放置區或將檔案拖曳到其上，上傳 PDF。
2. 選擇您偏好的 **匯出格式**：CSV、JSON 或 Markdown。
3. 點擊 **擷取** 開始處理。
4. 如果找到一個表格，會下載為單一檔案。多個表格則會產生 ZIP 封存檔，每個表格各一個檔案。

## 選項

- **匯出格式**：可選擇：
  - **CSV**：逗號分隔值，含有逗號、引號或換行的欄位會正確加上引號。適用於試算表與資料庫。
  - **JSON**：陣列的陣列結構，以 2 個空格縮排美化輸出。適用於程式處理。
  - **Markdown**：由 PyMuPDF 產生的管線分隔表格格式。適用於文件與 README 檔案。

## 輸出格式

- **單一表格**：`filename_table.csv`（或 `.json` / `.md`）
- **多個表格**：`filename_tables.zip`，內含名為 `table_1_page3.csv`、`table_2_page5.csv` 等的檔案。

## 使用情境

- 從冗長的 PDF 報告中擷取特定表格，而不必取出整份文件的資料。
- 取得 Markdown 格式的表格，直接貼到 GitHub issue、wiki 或文件中。
- 從 PDF 表格中取出結構化的 JSON 資料，用於 API 整合或指令碼。
- 將不同版本 PDF 的表格都匯出為 CSV 並比對差異，以進行比較。

## 提示

- 此工具提供逐一表格的控制。如果您只想將所有表格匯出到單一 CSV，請使用 [PDF 轉 CSV](./pdf-to-csv)。如需完整的 Excel 活頁簿，請使用 [PDF 轉 Excel](./pdf-to-excel)。
- 跨多頁的表格可能會在每一頁被偵測為獨立表格。您可能需要手動將它們串接起來。
- 如果未偵測到任何表格，該 PDF 可能是掃描圖片。請先進行 OCR 以加入文字層。

## 相關工具

- [PDF 轉 CSV](./pdf-to-csv)
- [PDF 轉 Excel](./pdf-to-excel)
- [PDF 轉文字](./pdf-to-text)
