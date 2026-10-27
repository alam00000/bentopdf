# Docker / Podmanでデプロイする

本番環境でBentoPDFをセルフホストする最も簡単な方法です。

> [!IMPORTANT]
> **Officeファイル変換に必要なヘッダー**
>
> LibreOfficeベースのツール（Word、Excel、PowerPointの変換）が `SharedArrayBuffer` を使うには、次のHTTPヘッダーが必要です。
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> ページはセキュアコンテキストから配信される必要もあります。ローカルでのテストでは `http://localhost` が使えますが、`http://192.168.x.x` などのLAN IPは通常これに該当しないため、ヘッダーが設定されていてもプレーンなHTTPではOffice変換が失敗します。
>
> 公式のコンテナイメージにはこれらのヘッダーが含まれています。リバースプロキシ（Traefik、Caddyなど）を使う場合は、これらのヘッダーが保持されるか追加されるようにし、ループバック以外からのアクセスにはHTTPSを使ってください。

> [!TIP]
> **Podmanユーザー：** すべての `docker` コマンドは、`docker` を `podman` に、`docker-compose` を `podman-compose` に置き換えればPodmanでも動作します。

## クイックスタート

> [!TIP]
> BentoPDFには2つのビルドがあります。
>
> - **セルフホスト版ビルド**：`ghcr.io/alam00000/bentopdf-simple:latest`。マーケティング用の要素（ヒーロー、FAQ、お客様の声、フッター）**なし**で、すべてのPDFツールを備えています。社内・チーム・組織向けのデプロイに使います。機能を減らした「ライト」版では**ありません**。
> - **商用版ビルド**：`ghcr.io/alam00000/bentopdf:latest`。マーケティングサイト全体を含み、bentopdf.com自体や、公開向けにデプロイする商用ライセンス保持者が使います。
>
> 迷ったらセルフホスト版ビルドを取得してください。

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

`docker-compose.yml` を作成します。

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

実行します。

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## 独自イメージをビルドする

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

ビルドして実行します。

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## 環境変数

| 変数                                 | 説明                                                                                                                                                                        | デフォルト                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | セルフホスト版をビルドします（bentopdf.com のマーケティング要素であるヒーロー、FAQ、お客様の声、フッターを非表示にします）。すべてのPDFツールは残ります。                   | `false`                                                        |
| `BASE_URL`                           | サブディレクトリへのデプロイ                                                                                                                                                | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | PyMuPDF WASMモジュールのURL                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Ghostscript WASMモジュールのURL                                                                                                                                             | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | CoherentPDF WASMモジュールのURL                                                                                                                                             | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | OCRワーカースクリプトのURL                                                                                                                                                  | _（空。Tesseract.jsのデフォルトCDNを使用）_                    |
| `VITE_TESSERACT_CORE_URL`            | OCRコアランタイムのディレクトリ                                                                                                                                             | _（空。Tesseract.jsのデフォルトCDNを使用）_                    |
| `VITE_TESSERACT_LANG_URL`            | OCR traineddataのディレクトリ                                                                                                                                               | _（空。Tesseract.jsのデフォルトCDNを使用）_                    |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | UIに表示するOCR言語（カンマ区切り）                                                                                                                                         | _（空。全カタログを表示）_                                     |
| `VITE_OCR_FONT_BASE_URL`             | OCRテキストレイヤー用フォントのディレクトリ                                                                                                                                 | _（空。リモートのNotoフォントURLを使用）_                      |
| `VITE_DEFAULT_LANGUAGE`              | デフォルトのUI言語                                                                                                                                                          | `en`                                                           |
| `VITE_BRAND_NAME`                    | カスタムブランド名                                                                                                                                                          | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | `public/` からの相対ロゴパス                                                                                                                                                | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | カスタムのフッター／著作権テキスト                                                                                                                                          | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | 非表示にするツールID（カンマ区切り）                                                                                                                                        | _（空。すべてのツールが有効）_                                 |
| `DISABLE_GITHUB_STARS`               | ページ読み込み時のGitHubスター数の取得をスキップし、CSPから `api.github.com` を除外します。Simple Modeのビルドでは常にスキップされます。                                    | `false`                                                        |
| `SITE_URL`                           | canonical、hreflang、サイトマップのリンクに書き込まれる公開URL。検索エンジンにデプロイ先を独立したサイトとして扱わせたい場合を除き、デフォルトのままにしてください。        | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | カスタムの `SITE_URL` を使う場合、検索結果でbentopdf.comと競合しないよう、すべてのページが `noindex` になります。検索エンジンにインデックスさせるには `true` に設定します。 | `false`                                                        |

WASMモジュールのURLには、CDNのデフォルトがあらかじめ設定されているため、高度な機能はすべてそのまま動作します。エアギャップ環境やセルフホスト環境では、これらを上書きしてください。

### 検索エンジン

デフォルトでは、すべてのページが元のページとしてbentopdf.comを検索エンジンに示すため、デプロイ先が重複ページとして表示されることはありません。プライベートな環境や社内のインスタンスでは、何も変更する必要はありません。

- **インスタンスを検索結果にまったく表示させない：** コンテナを `-e ROBOTS_NOINDEX=true` で実行します。再起動だけで済み、再ビルドは不要です。
- **インスタンスを検索結果で独立したサイトにする：** `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true` を付けてビルドします。`ALLOW_INDEXING=true` がないと、カスタムの `SITE_URL` ではすべてのページが `noindex` になります。

### Content-Security-Policy

nginxイメージには、強制モードの `Content-Security-Policy` ヘッダーが含まれています。CSPの `script-src`、`connect-src`、`font-src` ディレクティブは、上記の `VITE_*` URL変数から**ビルド時に生成**されます。`--build-arg` で渡したホストは自動的にポリシーに追加されます。

そのため：

- ビルド時に `VITE_CORS_PROXY_URL` や `VITE_WASM_*_URL` を上書きすると、CSPがそれらのオリジンを自動的に許可します。追加の設定は不要です。
- `cdn.jsdelivr.net` 上のURLでは、`script-src` はCDN全体ではなく、バージョンまで含む正確なパッケージフォルダ（例：`https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`）だけを許可します。jsDelivrは公開されているあらゆるnpmパッケージやGitHubリポジトリを配信するため、ホスト全体を許可すると、そのどれもがインスタンス上で実行できてしまうからです。それ以外のホスト上のURLは、オリジン単位で許可されます。
- アプリ内の詳細設定ページで、_実行時_ にカスタムのWASM URLを設定した場合、それらのオリジンはCSPに含まれないため、ブラウザはそれらへのフェッチをブロックします。ビルド時に設定したバージョンのみが許可されるため、`cdn.jsdelivr.net` 上の同じパッケージの別バージョンにも当てはまります。実行時の設定は試験用です。恒久的なカスタムURLには、対応する `VITE_*` のビルド引数を設定してください。
- 3つの `VITE_WASM_*_URL` をすべて上書きしたエアギャップ環境のデプロイでは、それらの `cdn.jsdelivr.net` パッケージフォルダもCSPから削除されます（各デフォルトは追加ではなく置換されます）。`cdn.jsdelivr.net` 上のTesseract OCRのデフォルトは、3つの `VITE_TESSERACT_*` も設定するまでポリシーに残ります。同様に、`VITE_CORS_PROXY_URL` を設定すると、公開の `bentopdf-cors-proxy.bentopdf.workers.dev` というデフォルトが置き換えられます。

CSPの `script-src` に `'unsafe-eval'` が含まれているのは、LibreOffice WASMランタイム（Word/Excel/PowerPoint変換ツールで使用）とwasm-vips画像ライブラリ（PDFからTIFFで使用）が、`new Function()` で内部のディスパッチコードをコンパイルするためです。これを削除するとそれらのツールが動作しなくなります。`SIMPLE_MODE`（LibreOfficeなし）でビルドし、PDFからTIFFが不要な場合は、生成された `security-headers.conf` を手動で編集して `'unsafe-eval'` を外すことで、より厳格なポリシーにできます。

OCRでは、`VITE_TESSERACT_*` 変数を空のままにするとデフォルトのオンラインアセットを使い、セルフホスト／オフラインのOCRでは3つすべてを一緒に設定します。ワーカー、コアランタイム、traineddataディレクトリは対応している必要があるため、一部だけの上書きは拒否されます。完全オフラインで検索可能なPDFを出力するには、`VITE_OCR_FONT_BASE_URL` も設定して、OCRテキストレイヤー用フォントを公開のNotoフォントURLではなく社内サーバーから読み込むようにします。

`VITE_DEFAULT_LANGUAGE` は、初めて訪れたユーザーのUI言語を設定します。サポートされる値：`en`、`ar`、`be`、`fr`、`de`、`es`、`zh`、`zh-TW`、`vi`、`tr`、`id`、`it`、`pt`、`nl`、`da`。ユーザーは引き続き言語を切り替えられ、これは既定値を変えるだけです。

例：

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### カスタムブランディング

デフォルトのBentoPDFのロゴ、名前、フッターテキストを独自のものに置き換えます。ロゴファイルを `public/` フォルダに置く（または既存の画像を使う）、ビルド時にブランディング用の変数を渡します。

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

ブランディングはフルモードとSimple Modeの両方で動作し、他のすべてのビルド時オプションと組み合わせられます。

### 特定のツールを無効にする

コンプライアンスやセキュリティ要件に応じて、UIからツールを非表示にします。無効にしたツールは、ホームページ、検索結果、キーボードショートカット、ワークフロービルダーから削除されます。URLに直接アクセスすると「ツールは利用できません」ページが表示されます。

ツールIDは、ページURLから `.html` を除いたものです。たとえばツールが `bentopdf.com/edit-pdf.html` にある場合、IDは `edit-pdf` です。

#### ツールIDの調べ方

最も簡単な方法：BentoPDFで任意のツールを開き、URLを見ます。パスの最後の部分（`.html` を除く）がツールIDです。

<details>
<summary>ツールIDの完全な一覧</summary>

**編集と注釈：** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**PDFに変換：** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**PDFから変換：** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**整理と管理：** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**最適化と修復：** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**セキュリティ：** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### オプション1：ビルド時（Dockerのビルド引数）

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

これにより、無効化リストがJavaScriptバンドルに組み込まれます。変更するには再ビルドが必要です。

#### オプション2：実行時（config.json）

`config.json` ファイルを配信ディレクトリにマウントします。再ビルドは不要です。

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Docker Composeを使う場合：

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

両方の方法を組み合わせることもでき、その場合はリストが統合されます。どちらかに含まれるツールは無効になります。

#### エディタ機能を無効にする

エディタツール全体を無効にせずに、PDFエディタ内の特定の機能（墨消し、注釈、フォームなど）だけを無効にすることもできます。`config.json` に `editorDisabledCategories` を追加します。

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>エディタカテゴリの完全な一覧</summary>

**ズーム：** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**注釈：** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**図形：** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**フォーム：** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**墨消し：** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**ドキュメント：** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**ページ：** `page`, `spread`, `rotate`, `scroll`, `navigation`

**パネル：** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**ツール：** `tools`, `pan`, `pointer`, `capture`

**選択：** `selection`, `selection-copy`

**履歴：** `history`, `history-undo`, `history-redo`

</details>

カテゴリは階層構造になっており、親（例：`annotation`）を無効にすると、その子もすべて無効になります。

### GitHubスターカウンターを無効にする

ナビゲーションバーには、ページ読み込み時に `api.github.com` から取得するGitHubスター数のライブ表示があります。これはPDF機能とは無関係な、唯一の外部リクエストです。ビルド時に無効にすると、フェッチのコードがバンドルから取り除かれ、Content-Security-Policyから `api.github.com` も除外されます。

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Modeのビルド（`bentopdf-simple`）では常にスターカウンターをスキップします。このフラグが必要なのは、商用版ビルドまたはカスタムのフルビルドの場合だけです。

### カスタムWASM URL（エアギャップ／セルフホスト）

> [!IMPORTANT]
> WASMのURLは**ビルド時**にJavaScriptへ組み込まれます。WASMファイルは実行時に**ユーザーのブラウザ**がダウンロードするもので、Dockerはビルド中にダウンロードしません。エアギャップのネットワークでは、ブラウザから到達できる社内サーバーでWASMファイルをホストする必要があります。

**エアギャップ環境の完全なワークフロー：**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

`bash scripts/prepare-airgap.sh --list-ocr-languages` で表示されるコード、または `bash scripts/prepare-airgap.sh --search-ocr-language <term>` で名前から検索したコードを、`--ocr-languages` に使います。OCR言語のサブセットを制限してビルドする場合は、同じコードを `VITE_TESSERACT_AVAILABLE_LANGUAGES` に渡し、アプリにバンドルされた言語だけが表示されるようにします。完全オフラインのOCR出力には、同梱の `ocr-fonts/` ディレクトリもホストし、`VITE_OCR_FONT_BASE_URL` をそこに向けてください。

変数を空文字列に設定すると、そのモジュールが無効になります（ユーザーは詳細設定から手動で設定する必要があります）。

## カスタムポート

デフォルトでは、BentoPDFはコンテナ内のポート `8080` で待ち受けます。変更するには、実行時に `PORT` 環境変数を設定します。

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| 変数   | 説明                              | デフォルト |
| ------ | --------------------------------- | ---------- |
| `PORT` | コンテナ内のNginxの待ち受けポート | `8080`     |

これは標準のDockerfileとnonrootのDockerfileの両方で動作します。

## カスタムユーザーID（PUID/PGID）

特定の非rootユーザーでの実行が必要な環境（NASデバイス、セキュリティコンテキストを使うKubernetes、組織のポリシーなど）向けに、BentoPDFはLSIO形式のPUID/PGIDに対応した別のDockerfileを提供しています。

### ビルドと実行

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### 環境変数

| 変数           | 説明                     | デフォルト |
| -------------- | ------------------------ | ---------- |
| `PUID`         | 実行するユーザーID       | `1000`     |
| `PGID`         | 実行するグループID       | `1000`     |
| `PORT`         | Nginxの待ち受けポート    | `8080`     |
| `DISABLE_IPV6` | IPv6リスナーを無効にする | `false`    |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### 仕組み

コンテナはrootで起動し、指定されたPUID/PGIDでユーザーを作成して、書き込み可能なすべてのディレクトリの所有権を調整し、`su-exec` で権限を落とします。nginxプロセスは、指定したユーザーとして完全に実行されます。

> [!NOTE]
> 標準の `Dockerfile` は `nginx-unprivileged`（UID 101）を使い、ほとんどのデプロイで推奨されます。`Dockerfile.nonroot` は、特定のUID/GIDが必要な場合にのみ使ってください。

> [!WARNING]
> PUID/PGIDは `0`（root）にできません。エントリポイントが入力を検証し、無効な値の場合はエラーで終了します。

## Traefik（リバースプロキシ）との併用

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Caddy（リバースプロキシ）との併用

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile：

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## リソース制限

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet（Systemd連携）

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)を使うと、Podmanコンテナをsystemdサービスとして実行できます。Linuxシステムでの本番デプロイに最適です。

### 基本的なQuadletのセットアップ

コンテナユニットファイルを `~/.config/containers/systemd/bentopdf.container`（ユーザー）または `/etc/containers/systemd/bentopdf.container`（システム）に作成します。

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### 有効化と起動

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> システム全体にデプロイする場合は、`--user` フラグなしで `systemctl` を使い、ファイルを `/etc/containers/systemd/` に置いてください。

### ヘルスチェック付きのQuadlet

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Quadletによる自動更新

Podmanは、新しいイメージが利用可能になると、コンテナを自動的に更新できます。

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadletのネットワーク設定

カスタムのネットワーク設定には、ネットワークファイル `bentopdf.network` を作成します。

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

続いて、コンテナファイルでそれを参照します。

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## 更新

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
