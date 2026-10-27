# Vercel にデプロイする

[Vercel](https://vercel.com) は、静的サイトを最も簡単にデプロイできるサービスです。

## ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## 手動デプロイ

### ステップ 1: リポジトリをフォークする

[bentopdf/bentopdf](https://github.com/alam00000/bentopdf) を自分の GitHub アカウントにフォークします。

### ステップ 2: Vercel にインポートする

1. [vercel.com/new](https://vercel.com/new) にアクセスします
2. フォークしたリポジトリを選択します
3. プロジェクトを設定します。

| 設定             | 値              |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### ステップ 3: 環境変数（任意）

必要に応じて、次の変数を追加します。

| 変数                    | 説明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `SIMPLE_MODE`           | 最小限の UI にするには `true` を設定します               |
| `VITE_BRAND_NAME`       | カスタムブランド名（"BentoPDF" を置き換えます）          |
| `VITE_BRAND_LOGO`       | `public/` からの相対ロゴパス（例: `images/my-logo.svg`） |
| `VITE_FOOTER_TEXT`      | カスタムのフッター/著作権テキスト                        |
| `VITE_DEFAULT_LANGUAGE` | デフォルトの UI 言語（例: `fr`、`de`、`es`）             |

### ステップ 4: デプロイする

「Deploy」をクリックして、ビルドが完了するのを待ちます。

## カスタムドメイン

1. プロジェクトの設定を開きます
2. 「Domains」に移動します
3. カスタムドメインを追加します
4. 指示に従って DNS を設定します

## 制限事項

::: warning 大きなファイル
Vercel のサーバーレス関数には 50MB の制限があります。BentoPDF は静的サイトなので影響はないはずですが、WASM モジュールは大きく（合計で約 100MB）、`/public` フォルダーから配信されるようにしてください。
:::

## トラブルシューティング

### ビルドのタイムアウト

ビルドがタイムアウトする場合は、次を試してください。

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 更新すると 404 になる

SPA のルーティング用に `vercel.json` を追加します。

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel から PDF への変換が動作しない

LibreOffice WASM による変換には `SharedArrayBuffer` が必要で、すべてのページで次のレスポンスヘッダーが必要です。

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

事前圧縮された `.wasm.gz` と `.data.gz` ファイルにも、ブラウザーが展開できるよう `Content-Encoding: gzip` が必要です。

これらを `vercel.json` に追加します。

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

確認するには、DevTools のコンソールを開いて `console.log(window.crossOriginIsolated)` を実行します。`true` が返れば正常です。
