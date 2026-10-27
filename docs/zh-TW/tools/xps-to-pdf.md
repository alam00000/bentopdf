---
title: XPS 轉 PDF
description: 在瀏覽器中將 XPS 與 OXPS 文件轉換為 PDF 格式。無需上傳、免註冊、完全私密。
---

# XPS 轉 PDF

將 Microsoft XPS 與 OXPS 文件轉換為標準 PDF 檔案。XPS（XML Paper Specification）是 Microsoft 對抗 PDF 的格式，但各平台對它的支援已逐漸減少。此工具能讓這些文件再次在任何地方都能閱讀。

## 支援的格式

| 格式 | 副檔名  | 備註                          |
| :--- | :------ | :---------------------------- |
| XPS  | `.xps`  | 原始的 Microsoft XPS 格式     |
| OXPS | `.oxps` | Open XPS，ECMA-388 標準的變體 |

## 運作方式

1. 點選上傳區域，或拖放您的 XPS/OXPS 檔案。可一次選取多個檔案。
2. 檢閱檔案清單。使用垃圾桶圖示移除個別檔案，或點選**新增更多檔案**附加其他文件。
3. 點選**轉換為 PDF**。PyMuPDF 引擎會在您的瀏覽器中於本機處理每份文件。
4. 單一檔案會直接下載為 PDF。多個檔案會打包成名為 `xps-converted.zip` 的 ZIP 壓縮檔。

## 選項

此工具直接進行格式轉換，無需其他設定。輸出會保留 XPS 來源的原始頁面尺寸、向量圖形、字型與圖片。

## 使用情境

- 開啟從預設使用 XPS 列印驅動程式的舊版 Windows 系統收到的 XPS 檔案
- 轉換 Windows 10/11 的 OXPS 文件，以便與 macOS 或 Linux 使用者分享
- 將舊有的 XPS 檔案封存為支援更廣泛的格式
- 讓以 XPS 製作的政府或企業文件能供外部收件者存取

## 提示

- `.xps` 與 `.oxps` 副檔名都會自動處理，您可以在同一批次中混合使用。
- 如果原始 XPS 檔案是由高解析度列印驅動程式建立，產生的 PDF 會保留該品質，不會重新取樣。

## 相關工具

- [Word 轉 PDF](./word-to-pdf)
- [XML 轉 PDF](./xml-to-pdf)
