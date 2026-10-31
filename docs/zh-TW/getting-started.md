# 快速入門

歡迎使用 BentoPDF！本指南將協助您快速上手。

## 什麼是 BentoPDF？

BentoPDF 是一套免費、開源、以隱私為優先的 PDF 工具箱，**完全在您的瀏覽器中**執行。您的檔案絕不會離開您的裝置，所有處理都透過 WebAssembly（WASM）技術在本機完成。

## 快速開始

### 選項 1：使用線上版

前往 [bentopdf.com](https://www.bentopdf.com) 即可立即使用 BentoPDF，無需安裝。

### 選項 2：使用 Docker 自行架設

> [!IMPORTANT]
> Office 檔案轉換需要 `SharedArrayBuffer`，而它需要以下全部條件：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - 安全環境（secure context）
>
> `http://localhost` 可用於本機測試，因為瀏覽器將迴路位址視為可信任。`http://192.168.x.x` 或其他區域網路 IP 通常不行，因此從網路中的其他裝置存取時，Word/Excel/PowerPoint 轉換需要 HTTPS。

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF 提供兩種版本：**自行架設版**（`bentopdf-simple`，即上方所用）適用於內部、團隊或組織部署；**商業版**（`bentopdf:latest`）則由 bentopdf.com 本身以及執行對外公開部署的商業授權持有者使用。兩者提供相同的 PDF 工具，商業版另外加入 bentopdf.com 的主視覺、常見問題、使用者推薦與頁尾。如果不確定，請使用自行架設版。

接著在瀏覽器中開啟 `http://localhost:3000`。

> [!NOTE]
> 如果您正在準備離線隔離（air-gapped）的 OCR 部署，除了 Tesseract worker、核心執行環境與 traineddata 檔案外，還必須在內部架設 OCR 文字層字型。完整設定請參閱[自行架設](/zh-TW/self-hosting/)，包括 `VITE_OCR_FONT_BASE_URL` 與內建的 `ocr-fonts/` 目錄。

### 選項 3：從原始碼建置

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 功能一覽

| 類別            | 工具                                                   |
| --------------- | ------------------------------------------------------ |
| **轉換為 PDF**  | Word、Excel、PowerPoint、圖片、Markdown、EPUB、MOBI 等 |
| **從 PDF 轉換** | JPG、PNG、文字、Excel、SVG 等                          |
| **編輯與註解**  | 簽署、螢光標示、塗黑遮蔽、填寫表單、加入印章           |
| **整理**        | 合併、分割、旋轉、刪除頁面、重新排序                   |
| **最佳化**      | 壓縮、修復、平面化、OCR                                |
| **安全性**      | 加密、解密、移除限制                                   |

## 瀏覽器支援

BentoPDF 在現代瀏覽器上效果最佳：

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## 後續步驟

- [探索所有工具](/zh-TW/tools/)
- [自行架設 BentoPDF](/zh-TW/self-hosting/)
- [參與專案貢獻](/zh-TW/contributing)
