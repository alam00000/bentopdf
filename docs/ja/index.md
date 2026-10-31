---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: '無料のオープンソースPDFツール'
  tagline: PDFの処理はすべてブラウザ内で。アップロードなし。サーバーなし。完全なプライバシー。
  actions:
    - theme: brand
      text: はじめに
      link: /ja/getting-started
    - theme: alt
      text: ツールを見る
      link: /ja/tools/
    - theme: alt
      text: セルフホスト
      link: /ja/self-hosting/
    - theme: alt
      text: 商用ライセンス
      link: /ja/licensing

features:
  - icon: 🔒
    title: 100%プライベート
    details: ファイルがデバイスの外に出ることはありません。処理はすべてWebAssemblyを使ってブラウザ内でローカルに行われます。
  - icon: ⚡
    title: 高速で無料
    details: 登録不要、制限なし、透かしなし。無制限のPDF処理をずっと無料で。
  - icon: 🛠️
    title: 50以上のツール
    details: 変換、編集、結合、分割、圧縮、署名、OCRなど。必要なものがすべて1か所に。

  - icon: 🌐
    title: セルフホスト可能
    details: 自社のインフラにデプロイできます。Docker、Vercel、Netlify、AWS、さらにセルフホストのOCRワーカー、言語データ、テキストレイヤー用フォントを備えた完全エアギャップ環境にも対応。
---

## オフラインOCR

エアギャップ環境やオフライン環境にBentoPDFをセルフホストする場合、OCRにはTesseractのワーカーとtraineddataファイルだけでなく、検索可能なPDFの出力に必要なOCRテキストレイヤー用フォントも社内で配信する必要があります。
`VITE_OCR_FONT_BASE_URL`、同梱の `ocr-fonts/` ディレクトリ、更新されたエアギャップ向けワークフローを含む完全な手順は[セルフホスティング](/ja/self-hosting/)を参照してください。
