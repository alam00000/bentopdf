# はじめに

BentoPDFへようこそ。このガイドですぐに使い始められます。

## BentoPDFとは？

BentoPDFは、無料でオープンソースの、プライバシーを第一に考えたPDFツールキットで、**すべてブラウザ内で**動作します。ファイルがデバイスの外に出ることはなく、処理はすべてWebAssembly（WASM）技術を使ってローカルで行われます。

## クイックスタート

### オプション1：ホスト版を使う

[bentopdf.com](https://www.bentopdf.com) にアクセスすればすぐに使えます。インストールは不要です。

### オプション2：Dockerでセルフホストする

> [!IMPORTANT]
> Officeファイルの変換には `SharedArrayBuffer` が必要で、次の両方が求められます。
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - セキュアコンテキスト
>
> ブラウザはループバックを信頼できるものとして扱うため、ローカルでのテストでは `http://localhost` が使えます。`http://192.168.x.x` などのLAN IPは通常これに該当しないため、ネットワーク内の他のデバイスからアクセスする場合、Word/Excel/PowerPointの変換にはHTTPSが必要になります。

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDFには2つのビルドがあります。社内・チーム・組織向けのデプロイ用の**セルフホスト版ビルド**（`bentopdf-simple`、上で使用）と、bentopdf.com自体や、公開向けにデプロイする商用ライセンス保持者が使う**商用版ビルド**（`bentopdf:latest`）です。どちらも同じPDFツールを備えており、商用版ビルドにはbentopdf.comのヒーロー、FAQ、お客様の声、フッターが加わります。迷ったらセルフホスト版ビルドを使ってください。

その後、ブラウザで `http://localhost:3000` を開きます。

> [!NOTE]
> エアギャップ環境でOCRをデプロイする場合は、Tesseractのワーカー、コアランタイム、traineddataファイルに加えて、OCRテキストレイヤー用フォントも社内でホストする必要があります。`VITE_OCR_FONT_BASE_URL` や同梱の `ocr-fonts/` ディレクトリを含む完全な手順は[セルフホスティング](/ja/self-hosting/)に記載されています。

### オプション3：ソースからビルドする

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 機能一覧

| カテゴリ         | ツール                                                  |
| ---------------- | ------------------------------------------------------- |
| **PDFに変換**    | Word、Excel、PowerPoint、画像、Markdown、EPUB、MOBIなど |
| **PDFから変換**  | JPG、PNG、テキスト、Excel、SVGなど                      |
| **編集と注釈**   | 署名、ハイライト、墨消し、フォーム入力、スタンプ追加    |
| **整理**         | 結合、分割、回転、ページ削除、並べ替え                  |
| **最適化**       | 圧縮、修復、フラット化、OCR                             |
| **セキュリティ** | 暗号化、復号、制限の解除                                |

## 対応ブラウザ

BentoPDFは最新のブラウザで最適に動作します。

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## 次のステップ

- [すべてのツールを見る](/ja/tools/)
- [BentoPDFをセルフホストする](/ja/self-hosting/)
- [プロジェクトにコントリビュートする](/ja/contributing)
