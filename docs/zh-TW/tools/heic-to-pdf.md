---
title: HEIC 轉 PDF
description: 直接在瀏覽器中將 iPhone 與 iPad 的 HEIC 和 HEIF 圖片轉換為 PDF 格式。
---

# HEIC 轉 PDF

將 HEIC/HEIF 圖片轉換為 PDF。自 iOS 11 起，HEIC 就是 iPhone 與 iPad 的預設照片格式。此工具讓您無需安裝任何桌面軟體或將檔案上傳到伺服器，就能把這些照片轉成 PDF。

## 支援格式

| 格式 | 副檔名  |
| :--- | :------ |
| HEIC | `.heic` |
| HEIF | `.heif` |

## 運作方式

1. 點擊上傳區域，或將 HEIC/HEIF 檔案拖放進來。
2. 檢查檔案清單並移除不需要的檔案。
3. 點擊 **轉換為 PDF**。結果會下載為 `from_heic.pdf`。

每個 HEIC 檔案都會透過 heic2any 函式庫解碼，以 92% 品質轉換為 PNG。接著使用 pdf-lib 將 PNG 嵌入 PDF，每張圖片各佔一頁，並保持完整解析度。

## 選項

此工具沒有提供其他設定。HEIC 圖片會先以高品質 (0.92) 轉換為 PNG 再嵌入。

## 使用情境

- 以 iPhone 照片建立 PDF，附加到保險理賠或報告中
- 將房地產物件的 HEIC 照片轉換為單一可列印文件
- 將 iPad 螢幕截圖（HEIF 格式）轉為可分享的 PDF
- 批次轉換旅遊照片製作旅行日誌

## 小技巧

- HEIC 解碼完全在瀏覽器中以 WebAssembly 進行。第一次轉換時可能需要稍候，等待解碼器載入。
- 如果您需要將 HEIC 與其他圖片格式（JPG、PNG 等）混合，請使用 [圖片轉 PDF](./image-to-pdf) 工具，它能同時處理 HEIC 與所有其他格式。
- iPhone 的 HEIC 檔案通常含有 EXIF 資料，包括 GPS 座標。輸出的 PDF 不會保留這些中繼資料。

## 相關工具

- [圖片轉 PDF](./image-to-pdf)
- [JPG 轉 PDF](./jpg-to-pdf)
- [PNG 轉 PDF](./png-to-pdf)
