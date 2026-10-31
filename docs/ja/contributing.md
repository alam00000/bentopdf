# コントリビュート

BentoPDFへのコントリビュートにご関心をお寄せいただきありがとうございます。このガイドで始め方を説明します。

## はじめに

### 前提条件

- Node.js 18+
- npm 9+
- Git

### セットアップ

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## プロジェクト構成

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

## 新しいツールの追加

### ステップ1：ロジックファイルを作成する

`src/js/logic/your-tool-page.ts` を作成します。

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### ステップ2：HTMLページを作成する

既存のツールテンプレートに倣って `src/pages/your-tool.html` を作成します。

### ステップ3：ツールを登録する

`src/js/config/tools.ts` に次を追加します。

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### ステップ4：ビルド設定に追加する

`vite.config.ts` にページを追加します。

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### ステップ5：翻訳を追加する

`public/locales/` 内のすべてのロケールファイルにエントリを追加します。

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## コードスタイル

- 新しいコードにはすべてTypeScriptを使用する
- 一貫性のため既存のパターンに従う
- コミット前に `npm run format` を実行する
- 本番コードにコメントは書かない（コメントはビルド時に削除されます）

## プルリクエストの手順

1. 機能ブランチを作成します：`git checkout -b feature/your-feature`
2. 変更を加えます
3. 十分にテストします：`npm run build`
4. 内容が明確にわかる説明を添えてPRを送信します

## 翻訳

新しい言語の追加については [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) を参照してください。

## コントリビューターライセンス契約

PRをマージする前に、CLAへの署名が必要です。

- [個人向けCLA（ICLA）](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [法人向けCLA（CCLA）](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## ヘルプ

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discordコミュニティ](https://discord.gg/Bgq3Ay3f2w)

## ライセンス

BentoPDFはデュアルライセンスです。

- **AGPL-3.0**：ソースコード全体を公開するオープンソースプロジェクト向け
- **商用ライセンス**：プロプライエタリ／クローズドソースのアプリケーション向け - [$79で永久ライセンスを購入](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

コントリビュートすることで、あなたの貢献がこれらの条件でライセンスされることに同意したものとみなされます。
