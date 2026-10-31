# セルフホスティングガイド

BentoPDF は、自分のインフラでセルフホストできます。このガイドでは、さまざまなデプロイ方法を紹介します。

## Docker / Podman でクイックスタート

BentoPDF をセルフホストする最も手早い方法です。

> [!TIP]
> BentoPDF には 2 種類のビルドがあります。
>
> - **セルフホスト版ビルド**: `ghcr.io/alam00000/bentopdf-simple:latest`。マーケティング用の要素（ヒーロー、FAQ、お客様の声、フッター）**なし**で、すべての PDF ツールを利用できます。社内、チーム、組織向けのデプロイにはこちらを使ってください。機能を削減した「ライト」版では**ありません**。
> - **商用版ビルド**: `ghcr.io/alam00000/bentopdf:latest`。マーケティングサイト全体を含み、bentopdf.com 自体や、一般公開向けのデプロイを行う商用ライセンス保有者が使用します。
>
> 迷った場合は、セルフホスト版ビルドを取得してください。

> [!IMPORTANT]
> Office ファイルの変換には `SharedArrayBuffer` が必要です。そのため、アプリはクロスオリジン分離され、かつセキュアコンテキストから配信される必要があります。公式イメージは必要な COOP/COEP ヘッダーをすでに送信していますが、`http://192.168.x.x` のようなプレーン HTTP のローカルネットワークオリジンでは、ブラウザーが `SharedArrayBuffer` を無効にします。
>
> `http://localhost` は、同じデバイス上でのテストにのみ使用してください。ユーザーが LAN の IP やホスト名で BentoPDF にアクセスする場合は、HTTPS で終端してください。

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

または、Docker Compose / Podman Compose を使います。

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet（Linux Systemd）

BentoPDF を systemd サービスとして実行します。`~/.config/containers/systemd/bentopdf.container` を作成します。

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Quadlet の詳しいドキュメントは、[Docker デプロイガイド](/ja/self-hosting/docker)を参照してください。

## ソースからビルドする

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## 設定オプション

### セルフホスト版ビルド（シンプルモード）

セルフホスト版ビルド（`bentopdf-simple` イメージ。シンプルモードとも呼ばれます）は、商用版ビルドと**機能的に同一**です。すべての PDF ツールが含まれ、同じように動作します。bentopdf.com 自体や、商用の一般公開向けデプロイでのみ意味を持つマーケティング用の要素を非表示にしているだけです。**機能を削減した「ライト」版ではありません。**

**セルフホスト版ビルドで非表示になるもの**（見た目のみで、PDF 機能は削除されません）：

- ナビゲーションバー、ヒーローセクション、機能セクション、FAQ、お客様の声、フッター
- ページタイトルが「PDFツール」に更新されます

**セルフホスト版ビルドで維持されるもの**（実際に PDF の処理を行うすべて）：

- すべての PDF ツール（結合、分割、編集、署名、OCR、Office 変換など）
- カスタムブランディングのサポート、すべてのビルド時および実行時の設定

商用版ビルド（`ghcr.io/alam00000/bentopdf:latest`）は bentopdf.com 自体を動かしているもので、一般公開向けのデプロイを行う商用ライセンス保有者が使用します。社内ツールでは意味をなさない、ヒーロー、FAQ、お客様の声、フッターが追加されています。

チーム、組織、または社内ツールとして BentoPDF をセルフホストする場合は、セルフホスト版ビルドを取得してください。

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

詳細は [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) を参照してください。

### 商用版ビルド（独自ブランドでの一般公開向けデプロイ）

商用版ビルド（`bentopdf` イメージ。`-simple` サフィックスなし）は、bentopdf.com 自体を動かしているものです。すべての PDF ツールに加えて、マーケティングサイト全体（ヒーロー、機能、FAQ、お客様の声、フッター）が含まれます。**BentoPDF を独自ブランドの一般公開向け PDF サービスとしてデプロイ**したい場合に、このビルドを使用します。たとえば次のようなケースです。

- 自分のドメインで、エンドユーザー向けのホスト型 SaaS として BentoPDF を運用する
- ツールだけでなく、ランディングページの体験（マーケティングセクション + ツール）が欲しい
- 商用ライセンス保有者として、商用製品に BentoPDF を組み込む

**そのまま実行する**（BentoPDF のブランディングのまま。ビルドのプレビューに便利です）：

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**独自のブランドでビルドする**（典型的な商用ワークフロー）：

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

その他のビルド時オプション（`BASE_URL`、`VITE_DEFAULT_LANGUAGE`、`DISABLE_TOOLS`、WASM URL の上書きなど）も、セルフホスト版ビルドと同じように使えます。

::: warning ライセンス
商用版ビルドの実行は、BentoPDF の 2 つのライセンスオプションのどちらでも許可されています。

- **AGPL-3.0**（無料）: ブランディングの変更や周辺のビジネスロジックを含め、デプロイのソースコード全体を AGPL の下で公開する場合に許可されます。
- **商用ライセンス**（$79 の買い切り）: ブランディングのフォークやビジネスコードをオープンソース化しない、クローズドソース/プロプライエタリなデプロイに必要です。

詳しい比較は[ライセンスのページ](https://www.bentopdf.com/licensing)を参照してください。AGPL ライセンスの WASM モジュール（PyMuPDF、Ghostscript、CoherentPDF）は実行時に CDN から読み込まれるため、イメージには含まれず、ライセンス上の立場も変わりません。
:::

### ベース URL

サブディレクトリにデプロイします。

```bash
BASE_URL=/pdf-tools/ npm run build
```

### カスタムブランディング

デフォルトの BentoPDF のロゴ、名前、フッターテキストを、ビルド時に独自のものへ置き換えます。

| 変数               | 説明                                     | デフォルト                              |
| ------------------ | ---------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | ヘッダーとフッターに表示されるブランド名 | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | `public/` からの相対ロゴパス             | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | カスタムのフッター/著作権テキスト        | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

または Docker を使います。

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

ブランディングはフルモードとシンプルモードの両方で機能し、他のすべてのビルド時オプション（`BASE_URL`、`SIMPLE_MODE`、`VITE_DEFAULT_LANGUAGE`）と組み合わせられます。

### 特定のツールを無効にする

コンプライアンスやセキュリティのために、個別のツールを非表示にします。無効にしたツールは、ホームページ、検索、ショートカット、ワークフロービルダー、直接の URL アクセスから削除されます。

ツール ID は、`.html` を除いたページの URL です。任意のツールを開いて URL を確認してください（例: `edit-pdf`、`sign-pdf`、`encrypt-pdf`）。

**ビルド時**（バンドルに組み込まれます）：

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**実行時**（再ビルド不要。`config.json` をマウントします）：

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

両方の方法を組み合わせることもできます。リストはマージされます。

PDF エディタ内の特定の機能（例: 墨消し）だけを、ツール全体を無効にせずに無効にすることもできます。`config.json` に `editorDisabledCategories` を追加します。カテゴリーの一覧は [Docker ガイド](/ja/self-hosting/docker#エディタ機能を無効にする)を参照してください。

## デプロイガイド

プラットフォームを選んでください。

- [Vercel](/ja/self-hosting/vercel)
- [Netlify](/ja/self-hosting/netlify)
- [Cloudflare Pages](/ja/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/ja/self-hosting/aws)
- [Hostinger](/ja/self-hosting/hostinger)
- [Nginx](/ja/self-hosting/nginx)
- [Apache](/ja/self-hosting/apache)
- [Docker](/ja/self-hosting/docker)
- [Kubernetes](/ja/self-hosting/kubernetes)
- [CORS Proxy](/ja/self-hosting/cors-proxy) - デジタル署名に必要です

## よくある問題

### Word / ODT / Excel / PowerPoint から PDF への変換がハングする（SharedArrayBuffer が利用できない）

**症状**: LibreOffice ベースの文書変換（Word、ODT、Excel、PowerPoint から PDF）が約 55% で止まる、または開始できません。ブラウザーのコンソールに次のように表示されることがあります。

> `ReferenceError: SharedArrayBuffer is not defined`

…または、`window.crossOriginIsolated` が `false` を返す、あるいは WASM のコンパイルで `expected magic word 00 61 73 6d, found 1f 8b 08 08` と報告されます。

**原因**: LibreOffice WASM には `SharedArrayBuffer` が必要で、ブラウザーはページが**クロスオリジン分離**され、かつ**セキュアコンテキスト**から配信されている場合にのみ、これを有効にします。つまり、次の 2 つの条件を満たす必要があります。

1. すべてのレスポンスに、次の両方のヘッダーが含まれていること。
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. ページが `https://...` または `http://localhost` から配信されていること。LAN IP（例: `http://192.168.x.x`）上のプレーン HTTP はセキュアとは見なされず、ブラウザーはそこで `SharedArrayBuffer` を無効にします。

`00 61 73 6d / 1f 8b 08 08` の不一致は別のサブ症状です。事前圧縮された `.wasm.gz` / `.data.gz` ファイルに `Content-Encoding: gzip` レスポンスヘッダーがないため、ブラウザーは展開された WASM ではなく、生の gzip バイト列を受け取っています。

**対処法**: 正確な設定は、各プラットフォームのデプロイガイドを参照してください。

- [Nginx →](/ja/self-hosting/nginx#word-odt-excel-から-pdf-への変換が動作しない)
- [Apache →](/ja/self-hosting/apache#word-odt-excelからpdfへの変換が動作しない)
- [AWS S3 + CloudFront →](/ja/self-hosting/aws#ステップ3b-レスポンスヘッダーポリシー-libreoffice-wasmに必須)
- [Cloudflare Pages →](/ja/self-hosting/cloudflare#設定ファイル)（`_headers` ファイル）
- [Netlify →](/ja/self-hosting/netlify#word-odt-excel-から-pdf-への変換が-55-で止まる)（`netlify.toml`）
- [Vercel →](/ja/self-hosting/vercel#word-odt-excel-から-pdf-への変換が動作しない)（`vercel.json`）
- [Hostinger →](/ja/self-hosting/hostinger#libreofficeツールが動作しない)（`.htaccess`）
- [Kubernetes →](/ja/self-hosting/kubernetes#sharedarraybuffer-ヘッダーが引き続き機能することを確認する-ingress-gateway)
- **Docker**: 同梱の nginx 設定によって自動的に処理されるため、操作は不要です。

**確認**: 任意の BentoPDF ページで DevTools のコンソールを開き、次を実行します。

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

ページが HTTPS または `http://localhost` で、かつすべてのレスポンスに COEP/COOP ヘッダーが含まれていれば、両方のチェックに合格します。`http://192.168.x.x` などのループバック以外の HTTP オリジンを使っている場合は、HTTPS で終端してください。ヘッダーだけで解決する方法はありません。

### `.mjs` ファイルが `application/octet-stream` として配信される

**症状**: PDFへ署名 / Form Filler など一部のツールで、ビューアが空白になる、または読み込みに失敗します。ブラウザーのコンソールに次のように表示されます。

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**原因**: Web サーバーまたはリバースプロキシに、`.mjs` ファイル（内蔵の PDF ビューアは、この拡張子で ES モジュールを同梱しています）の MIME タイプのマッピングがありません。多くの標準的なサーバー設定では、認識できない拡張子はデフォルトで `application/octet-stream` になり、ブラウザーはそれを ES モジュールとして実行することを拒否します。

**対処法**: 正確なスニペットは、各プラットフォームのデプロイガイドを参照してください。

- [Nginx →](/ja/self-hosting/nginx#pdfへ署名-または-form-filler-で空白のビューアが表示される-mjs-の-mime-エラー)
- [Apache →](/ja/self-hosting/apache#pdfへ署名またはフォーム入力で空白のビューアが表示される-mjs-のmimeエラー)
- [AWS S3 + CloudFront →](/ja/self-hosting/aws#ステップ2-ビルドしてアップロードする)（`aws s3 cp ... --include "*.mjs"` を参照）
- [Kubernetes →](/ja/self-hosting/kubernetes#mjs-の-mime-タイプエラー-pdfへ署名-form-filler-の-iframe-が空白になる)
- **Docker、Vercel、Netlify、Cloudflare Pages、Hostinger**: 自動的に処理されるため、操作は不要です。

**確認**: DevTools → Network タブを開き、失敗している `.mjs` リクエストを見つけて、`Content-Type` レスポンスヘッダーを確認します。`application/javascript` になっているはずです。それでも `application/octet-stream` の場合は、外側のリバースプロキシや CDN がタイプを再判定している可能性があります。配信経路の各層を確認してください。

## WASM の設定（AGPL コンポーネント）

BentoPDF は、AGPL ライセンスの処理ライブラリをソースコードに**同梱していません**が、すべての機能がそのまま動作するよう、CDN の URL を**あらかじめ設定**しています。手動での設定は不要です。

::: tip デフォルトでゼロコンフィグ
v2.0.0 以降、WASM モジュールは環境変数によって jsDelivr CDN から読み込まれるようあらかじめ設定されています。すべての高度な機能は、ユーザーが何も設定しなくてもすぐに使えます。
:::

| コンポーネント  | ライセンス | 機能                                           |
| --------------- | ---------- | ---------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0   | EPUB/MOBI/FB2/XPS の変換、画像の抽出、表の抽出 |
| **Ghostscript** | AGPL-3.0   | PDF/A 変換、圧縮、傾き補正、ラスタライズ       |
| **CoherentPDF** | AGPL-3.0   | 目次、添付ファイル、しおり付きの PDF 結合      |

### デフォルトの環境変数

これらは `.env.production` に設定され、ビルドに組み込まれます。

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### WASM URL を上書きする

カスタムデプロイでは、ビルド時にデフォルトを上書きできます。

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

モジュールを完全に無効にするには（詳細設定からユーザーが手動で設定する必要があります）、その変数を空文字列に設定します。

OCR の場合は、すべての `VITE_TESSERACT_*` 変数を空のままにしてデフォルトのオンラインアセットを使うか、セルフホスト/オフライン OCR 用に worker/core/lang の URL をまとめて設定します。特定の OCR 言語のみをバンドルする場合は、`VITE_TESSERACT_AVAILABLE_LANGUAGES` にも同じカンマ区切りのコードを設定してください。これにより、UI にはインストール済みの言語のみが表示され、サポートされていない選択は説明付きのエラーで失敗します。完全オフラインで検索可能な PDF を出力するには、バンドルされた OCR フォントを配信する社内ディレクトリを `VITE_OCR_FONT_BASE_URL` にも設定してください。

ユーザーは、UI の **詳細設定** からいつでもこれらのデフォルトを上書きできます。ブラウザーに保存されたユーザーの上書き設定は、環境のデフォルトより優先されます。

### エアギャップ / オフラインデプロイ

インターネットにアクセスできないネットワーク（政府、医療、金融など）向けです。WASM の URL は**ビルド時に** JavaScript へ組み込まれ、実際の WASM ファイルは実行時に**ユーザーのブラウザー**がダウンロードします。そのため、インターネットに接続できるマシンですべてを準備してから、隔離されたネットワークへ転送する必要があります。

#### 自動化スクリプト（推奨）

付属の `prepare-airgap.sh` スクリプトが、WASM パッケージのダウンロード、Docker イメージのビルド、セットアップスクリプト付きの自己完結型バンドルの作成まで、プロセス全体を自動化します。

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

これにより、次のバンドルディレクトリが作成されます。

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

USB、社内のアーティファクトリポジトリ、または承認された方法で、バンドルをエアギャップネットワークに転送します。その後、付属のセットアップスクリプトを実行します。

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

セットアップスクリプトは、Docker イメージの読み込み、WASM ファイルの展開を行い、必要に応じてコンテナーを起動します。

**スクリプトのオプション:**

| フラグ                         | 説明                                                                | デフォルト                                     |
| ------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------- |
| `--wasm-base-url <url>`        | WASM を社内でホストする場所                                         | _（必須。指定がない場合は入力を求められます）_ |
| `--image-name <name>`          | Docker イメージのタグ                                               | `bentopdf`                                     |
| `--output-dir <path>`          | 出力するバンドルのディレクトリ                                      | `./bentopdf-airgap-bundle`                     |
| `--simple-mode`                | シンプルモードを有効にする                                          | オフ                                           |
| `--base-url <path>`            | サブディレクトリのベース URL（例: `/pdf/`）                         | `/`                                            |
| `--language <code>`            | デフォルトの UI 言語（例: `fr`、`de`）                              | _（なし）_                                     |
| `--brand-name <name>`          | カスタムのブランド名                                                | _（なし）_                                     |
| `--brand-logo <path>`          | `public/` からの相対ロゴパス                                        | _（なし）_                                     |
| `--footer-text <text>`         | カスタムのフッターテキスト                                          | _（なし）_                                     |
| `--ocr-languages <list>`       | バンドルする OCR 言語（カンマ区切り）                               | `eng`                                          |
| `--list-ocr-languages`         | サポートされている OCR コードと名前を表示して終了する               | オフ                                           |
| `--search-ocr-language <term>` | 名前または略称で OCR コードを検索する                               | オフ                                           |
| `--dockerfile <path>`          | 使用する Dockerfile                                                 | `Dockerfile`                                   |
| `--skip-docker`                | Docker のビルドとエクスポートをスキップする                         | オフ                                           |
| `--skip-wasm`                  | WASM のダウンロードをスキップする（既存の `.tgz` ファイルを再利用） | オフ                                           |

対話式のプロンプトでは `list` と入力すると、サポートされているすべての Tesseract コードの一覧を表示でき、`search <term>` で一致するコードを検索できます（例: `search german`、`search chi`）。

::: warning 同一オリジンの要件
WASM ファイルは、BentoPDF アプリと**同じオリジン**から配信する必要があります。Web ワーカーは `importScripts()` を使用しますが、これはスクリプトをクロスオリジンで読み込めません。たとえば、BentoPDF が `https://internal.example.com` で動作している場合、WASM のベース URL も `https://internal.example.com/wasm` にする必要があります。
:::

#### 手動の手順

<details>
<summary>スクリプトを使わずに手動で行う場合</summary>

**ステップ 1: WASM と OCR のパッケージをダウンロードする**（インターネットに接続できるマシンで）

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**ステップ 2: 社内 URL を指定して Docker イメージをビルドする**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**ステップ 3: Docker イメージをエクスポートする**

```bash
docker save bentopdf -o bentopdf.tar
```

**ステップ 4: エアギャップネットワークへ転送する**

USB、社内のアーティファクトリポジトリ、または承認された転送方法でコピーします。

- `bentopdf.tar`: Docker イメージ
- ステップ 1 の 5 つの `.tgz` WASM/OCR パッケージ
- ステップ 1 の `tesseract-langdata/` ディレクトリ
- ステップ 1 の `ocr-fonts/` ディレクトリ

**ステップ 5: エアギャップネットワーク内でセットアップする**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

ステップ 2 で設定した URL でファイルにアクセスできることを確認してください。`.../ocr/worker.min.js`、`.../ocr/core`、`.../ocr/lang-data`、`.../ocr/fonts` も含まれます。

</details>

::: info Docker ではなくソースからビルドする場合
`npm run build` を実行する前に、`.env.production` に変数を設定します。

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### 独自の WASM プロキシをホストする

AGPL の WASM ファイルを適切な CORS ヘッダー付きで配信する必要がある場合は、シンプルなプロキシをデプロイできます。実装例は [Cloudflare WASM Proxy ガイド](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md)を参照してください。

::: tip なぜ分離しているのか
この分離により、次のことが保証されます。

- 商用ユーザーにとって明確な法令遵守
- BentoPDF のコアがデュアルライセンス（AGPL-3.0 / 商用）のまま維持されること
- WASM ファイルはソースにバンドルされるのではなく、実行時に読み込まれること
  :::

## システム要件

| 要件       | 最小                                   |
| ---------- | -------------------------------------- |
| ストレージ | 約 100 MB（AGPL モジュールを除くコア） |
| RAM        | 512 MB                                 |
| CPU        | 最近のプロセッサー                     |

::: tip
BentoPDF は静的サイトです。データベースやバックエンドサーバーは不要です！
:::
