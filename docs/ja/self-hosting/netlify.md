# Netlify にデプロイする

[Netlify](https://netlify.com) は、手厚い無料枠を備えた優れた静的サイトホスティングを提供しています。

## ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## 手動デプロイ

### ステップ 1: リポジトリを接続する

1. [Netlify](https://app.netlify.com) にログインします
2. 「Add new site」→「Import an existing project」をクリックします
3. GitHub アカウントを接続します
4. BentoPDF のフォークを選択します

### ステップ 2: ビルド設定を行う

| 設定              | 値              |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### ステップ 3: デプロイする

「Deploy site」をクリックして、ビルドが完了するのを待ちます。

## 設定ファイル

プロジェクトのルートに `netlify.toml` を作成します。

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning 重要
Word/ODT/Excel/PowerPoint から PDF への変換には、`Cross-Origin-Embedder-Policy` と `Cross-Origin-Opener-Policy` ヘッダーが必要です。これらがないと `SharedArrayBuffer` が使えず、LibreOffice WASM エンジンの初期化に失敗します。

`.wasm.gz` と `.data.gz` ファイルの `Content-Encoding: gzip` ヘッダーは、ブラウザーにそれらを自動的に展開させるためのものです。これがないと、ブラウザーは生の gzip バイト列を受け取り、WASM のコンパイルに失敗します。
:::

## 環境変数

Site settings → Environment variables で設定します。

| 変数                    | 説明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 最小構成のビルドにするには `true` を設定します           |
| `VITE_BRAND_NAME`       | カスタムブランド名（"BentoPDF" を置き換えます）          |
| `VITE_BRAND_LOGO`       | `public/` からの相対ロゴパス（例: `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | カスタムのフッター/著作権テキスト                        |
| `VITE_DEFAULT_LANGUAGE` | デフォルトの UI 言語（例: `fr`、`de`、`es`）             |

## カスタムドメイン

1. Site settings → Domain management に移動します
2. 「Add custom domain」をクリックします
3. 表示される DNS の設定手順に従います

## ラージメディア

大きな WASM ファイルには、[Netlify Large Media](https://docs.netlify.com/large-media/overview/) の有効化を検討してください。

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## トラブルシューティング

### Word/ODT/Excel から PDF への変換が 55% で止まる

文書の変換が 55% で止まる場合は、DevTools のコンソールを開いて次を確認します。

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

`crossOriginIsolated` が `false` の場合、`netlify.toml` の COEP/COOP ヘッダーが適用されていません。ファイルがプロジェクトのルートにあることを確認して、再デプロイしてください。

コンソールに `expected magic word 00 61 73 6d, found 1f 8b 08 08` と表示される場合は、`.wasm.gz` ファイルに `Content-Encoding: gzip` ヘッダーがありません。`soffice.wasm.gz` と `soffice.data.gz` 用の `[[headers]]` ブロックが `netlify.toml` に含まれていることを確認してください。

### ビルドが失敗する

Node のバージョンの互換性を確認します。

```toml
[build.environment]
  NODE_VERSION = "20"
```

### 初回の読み込みが遅い

Site settings → Build & deploy → Asset optimization で、アセットの最適化を有効にします。
