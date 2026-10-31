# 參與貢獻

感謝您有興趣為 BentoPDF 做出貢獻！本指南將協助您開始。

## 開始使用

### 事前準備

- Node.js 18+
- npm 9+
- Git

### 設定

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 專案結構

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## 新增工具

### 步驟 1：建立邏輯檔案

建立 `src/js/logic/your-tool-page.ts`：

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### 步驟 2：建立 HTML 頁面

依照現有的工具範本建立 `src/pages/your-tool.html`。

### 步驟 3：註冊工具

加入 `src/js/config/tools.ts`：

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### 步驟 4：加入建置設定

將頁面加入 `vite.config.ts`：

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### 步驟 5：新增翻譯

在 `public/locales/` 中的所有語系檔案加入項目：

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## 程式碼風格

- 所有新程式碼都使用 TypeScript
- 遵循現有模式以保持一致
- 提交前執行 `npm run format`
- 正式環境程式碼中不寫註解（建置時會移除註解）

## Pull Request 流程

1. 建立功能分支：`git checkout -b feature/your-feature`
2. 進行修改
3. 徹底測試：`npm run build`
4. 提交 PR 並附上清楚的說明

## 翻譯

新增語言請參閱 [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md)。

## 貢獻者授權協議

在您的 PR 合併之前，您需要簽署我們的 CLA：

- [個人 CLA（ICLA）](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [企業 CLA（CCLA）](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## 取得協助

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord 社群](https://discord.gg/Bgq3Ay3f2w)

## 授權

BentoPDF 採用雙重授權：

- **AGPL-3.0**：適用於公開分享完整原始碼的開源專案
- **商業授權**：適用於專有或閉源應用程式，[以 $79 取得終身授權](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

參與貢獻即表示您同意您的貢獻將依上述條款授權。
