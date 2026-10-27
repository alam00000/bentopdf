---
title: 為 AI 準備 PDF
description: 將 PDF 內容擷取為針對 LLM 與 LlamaIndex 等 AI 流程最佳化的結構化 JSON。支援批次處理。
---

# 為 AI 準備 PDF

從 PDF 檔案擷取內容，並整理成針對大型語言模型（LLM）與 LlamaIndex 等 AI 框架最佳化的 JSON 結構。每頁內容都會被擷取並組織成結構化格式，可直接用於 RAG 流程、聊天機器人或語意搜尋系統。

## 運作方式

1. 點擊放置區或將檔案拖曳到該處，上傳一個或多個 PDF。
2. 點擊 **擷取** 開始處理。
3. 單一檔案會下載為 `filename_llm.json`。多個檔案則產生 `pdf-for-ai.zip` 壓縮檔。

此工具使用 PyMuPDF 的 LlamaIndex 整合功能，擷取每頁內容與中繼資料，產生可直接載入 AI 框架的輸出。

## 選項

此工具沒有可設定的選項。所有頁面都會連同完整文字與中繼資料一併擷取。

## 輸出格式

- **單一檔案**：`filename_llm.json`
- **多個檔案**：`pdf-for-ai.zip`，每個輸入 PDF 各對應一個 `_llm.json`。

JSON 輸出遵循 LlamaIndex 文件結構描述，包含每頁的文字內容與中繼資料欄位。

## 使用情境

- 為檢索增強生成（RAG）流程準備 PDF 文件。
- 從 PDF 封存資料建立可供 AI 聊天機器人搜尋的知識庫。
- 將 PDF 報告輸入以 LLM 為基礎的分析工作流程。
- 預先處理研究論文，用於語意搜尋與問答系統。
- 從 PDF 文件集合建立結構化訓練資料。

## 提示

- 若只需擷取純文字而不需 AI 專用格式，請使用 [PDF 轉文字](./pdf-to-text)。
- 若需要保留標題與結構的 Markdown 輸出，請使用 [PDF 轉 Markdown](./pdf-to-markdown)。
- 掃描的 PDF 只會產生空白或極少的輸出。請先執行 OCR 加入文字層，再進行擷取。

## 相關工具

- [PDF 轉文字](./pdf-to-text)
- [PDF 轉 Markdown](./pdf-to-markdown)
- [PDF 轉 JSON](./pdf-to-json)
