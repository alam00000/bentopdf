# Cloudflare Pagesにデプロイする

[Cloudflare Pages](https://pages.cloudflare.com)は、帯域幅無制限で高速なグローバル静的サイトホスティングを提供します。

## クイックデプロイ

1. [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)に移動します
2. 「Create a project」をクリックします
3. GitHubリポジトリを接続します

## ビルド設定

| 設定                     | 値              |
| ------------------------ | --------------- |
| フレームワークプリセット | None            |
| ビルドコマンド           | `npm run build` |
| ビルド出力ディレクトリ   | `dist`          |
| ルートディレクトリ       | `/`             |

## 環境変数

設定 → 環境変数 で次を追加します。

| 変数                    | 値                                         |
| ----------------------- | ------------------------------------------ |
| `NODE_VERSION`          | `18`                                       |
| `SIMPLE_MODE`           | `false`（任意）                            |
| `VITE_BRAND_NAME`       | カスタムブランド名（任意）                 |
| `VITE_BRAND_LOGO`       | `public/` からの相対ロゴパス（任意）       |
| `VITE_FOOTER_TEXT`      | カスタムのフッター／著作権テキスト（任意） |
| `VITE_DEFAULT_LANGUAGE` | デフォルトのUI言語、例：`fr`（任意）       |

## 設定ファイル

`public` フォルダに `_headers` を作成します。

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning 重要
Word/ODT/Excel/PowerPointからPDFへの変換には、`Cross-Origin-Embedder-Policy` ヘッダーと `Cross-Origin-Opener-Policy` ヘッダーが必要です。これらがないと `SharedArrayBuffer` が使えず、LibreOffice WASMエンジンの初期化に失敗します。
:::

SPAのルーティング用に `_redirects` を作成します。

```
/*    /index.html   200
```

## カスタムドメイン

1. Pagesプロジェクトに移動します
2. 「Custom domains」をクリックします
3. ドメインを追加します
4. ドメインがCloudflareにある場合、CloudflareがDNSを自動設定します

## メリット

- **帯域幅無制限で無料**
- 300以上のエッジロケーションを持つ**グローバルCDN**
- **自動HTTPS**
- プルリクエストの**プレビューデプロイ**
- **高速なビルド**

## トラブルシューティング

### 大きなファイルのアップロード

Cloudflare Pagesは最大25 MBのファイルに対応しています。WASMモジュールは問題ないはずですが、上限に達した場合は次を検討してください。

```bash
# Split large files during build
npm run build
```

### Workerのサイズ制限

高度なルーティングにCloudflare Workersを使う場合は、無料プランでは1 MBの制限がある点に注意してください。

## CORSプロキシWorker（デジタル署名用）

デジタル署名ツールが証明書チェーンを取得するには、CORSプロキシが必要です。同梱のWorkerをデプロイします。

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### セキュリティ機能

| 機能                         | 説明                           |
| ---------------------------- | ------------------------------ |
| **URL制限**                  | 証明書のURLのみ許可            |
| **ファイルサイズ制限**       | 1リクエストあたり最大10MB      |
| **レート制限**               | 60リクエスト/IP/分（KVが必要） |
| **プライベートIPのブロック** | localhostと内部IPをブロック    |

### レート制限を有効にする

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### プロキシURLを指定してビルドする

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Dockerを使う場合：

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **注：** HMAC署名の設定については[README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required)を参照してください。
