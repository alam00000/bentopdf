---
title: JSON 轉 PDF
description: 從 BentoPDF 的 JSON 格式重建 PDF 檔案。將 JSON 匯出檔轉換回原始 PDF 文件。
---

# JSON 轉 PDF

從先前由 BentoPDF 的 **PDF 轉 JSON** 工具建立的 JSON 檔案重建 PDF 文件。這是一個往返轉換工具，它會讀取 PDF 的結構化 JSON 表示並重建原始文件。

::: warning
此工具僅接受由 BentoPDF 的 PDF 轉 JSON 轉換器所產生的 JSON 檔案。不支援來自 API、資料庫或其他工具的一般 JSON 檔案。
:::

## 支援格式

| 輸入    | 說明                                            |
| :------ | :---------------------------------------------- |
| `.json` | 由 BentoPDF 的 PDF 轉 JSON 工具匯出的 JSON 檔案 |

## 運作方式

1. 點擊上傳區域，或拖放一個或多個 JSON 檔案。
2. 檔案清單會顯示每個已選取的檔案及其大小。
3. 點擊 **轉換為 PDF**。工具會使用 Web Worker 與 CPDF 引擎處理所有檔案。
4. 輸出會下載為 `jsons-to-pdf.zip`，其中每個輸入 JSON 檔案各對應一個 PDF。

轉換在背景 Web Worker 中執行，因此即使處理大型檔案，介面仍能保持流暢回應。

## 選項

此工具沒有可設定的選項。輸出的 PDF 完全由 JSON 結構決定。

## 輸出

轉換多個 JSON 檔案時，結果會以 ZIP 壓縮檔提供。每個 PDF 以其來源 JSON 檔案命名（例如 `report.json` 會變成 `report.pdf`）。

## 使用情境

- 從以 JSON 為基礎的備份或封存流程還原 PDF
- 將 PDF 轉為 JSON 進行檢查，再轉回 PDF
- 以程式修改 JSON 結構後重建文件
- 透過轉換回 PDF，驗證 PDF 轉 JSON 匯出是否完整擷取所有文件內容

## 小技巧

- 如果您需要將任意 JSON 資料（例如 API 回應或設定檔）轉換為格式化的 PDF，[文字轉 PDF](./txt-to-pdf) 工具更合適。將 JSON 以文字形式貼上，就會以適當格式呈現。
- 此工具需要 CPDF WebAssembly 引擎才能運作。自行架設的執行個體需要設定 CPDF WASM 檔案。

## 相關工具

- [文字轉 PDF](./txt-to-pdf)
- [Markdown 轉 PDF](./markdown-to-pdf)
- [CSV 轉 PDF](./csv-to-pdf)
