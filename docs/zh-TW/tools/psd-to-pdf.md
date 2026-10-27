---
title: PSD 轉 PDF
description: 在瀏覽器中將 Photoshop（PSD）檔案轉換為 PDF。免費、私密，不需要 Adobe 軟體。
---

# PSD 轉 PDF

將 Adobe Photoshop PSD 檔案轉換為 PDF 文件。PSD 是 Photoshop 的原生格式，通常需要昂貴的 Adobe 軟體才能開啟。此工具會將 PSD 檔案的平面化合成影像轉譯為全解析度的 PDF 頁面。

## 支援格式

| 格式            | 副檔名 | 備註                 |
| :-------------- | :----- | :------------------- |
| Adobe Photoshop | `.psd` | 轉譯平面化的合成影像 |

## 運作方式

1. 點擊上傳區域，或將 PSD 檔案拖放到該處。支援多個檔案。
2. 檢查檔案清單。使用垃圾桶圖示移除不需要的檔案，或使用 **新增更多檔案** 加入更多檔案。
3. 點擊 **轉換為 PDF**。PyMuPDF 引擎會讀取 PSD 檔案，並以原始解析度將合成影像嵌入 PDF 頁面。
4. 單一 PSD 會產生一個 PDF。上傳多個 PSD 檔案時，會合併成一個名為 `psd_to_pdf.pdf` 的多頁 PDF，每個 PSD 各成為一頁。

## 選項

不需要任何設定。轉換器會使用 PSD 檔案中的平面化影像資料。

## 使用情境

- 不開啟 Photoshop 即可預覽 Photoshop 設計
- 將設計校樣寄給沒有 Adobe Creative Suite 的客戶
- 從 PSD 檔案列印高解析度作品
- 從多個 PSD 設計檔建立 PDF 作品集，每個檔案都成為同一份文件中的一頁

## 提示

- 轉換會轉譯 PSD 的合成（平面化）檢視。個別圖層、調整圖層與圖層效果不會在 PDF 中保留為獨立元素。
- 多個 PSD 檔案會合併成一個多頁 PDF，而不是各自產生 PDF。這很適合用來製作作品集或型錄。
- 解析度非常高的 PSD 檔案（300 DPI 以上的印刷檔）會產生較大的 PDF。此工具會保留完整解析度。

## 相關工具

- [圖片轉 PDF](./image-to-pdf)
- [PNG 轉 PDF](./png-to-pdf)
- [VSD 轉 PDF](./vsd-to-pdf)
