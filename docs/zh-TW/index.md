---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: '免費、開源的 PDF 工具'
  tagline: 完全在瀏覽器中處理 PDF。免上傳，無伺服器，完整保護隱私。
  actions:
    - theme: brand
      text: 快速入門
      link: /zh-TW/getting-started
    - theme: alt
      text: 查看工具
      link: /zh-TW/tools/
    - theme: alt
      text: 自行架設
      link: /zh-TW/self-hosting/
    - theme: alt
      text: 商業授權
      link: /zh-TW/licensing

features:
  - icon: 🔒
    title: 100% 隱私
    details: 您的檔案絕不離開您的裝置。所有處理都透過 WebAssembly 在您的瀏覽器中本機完成。
  - icon: ⚡
    title: 快速且免費
    details: 免註冊、無限制、無浮水印。永久免費處理無限量的 PDF。
  - icon: 🛠️
    title: 50+ 種工具
    details: 轉換、編輯、合併、分割、壓縮、簽署、OCR 等。一站滿足所有需求。

  - icon: 🌐
    title: 可自行架設
    details: 部署在您自己的基礎架構上。支援 Docker、Vercel、Netlify、AWS，或搭配自行架設 OCR worker、語言資料與文字層字型的完全離線隔離環境。
---

## 離線 OCR

如果您在離線隔離或離線環境中自行架設 BentoPDF，OCR 需要的不只是 Tesseract worker 與 traineddata 檔案。可搜尋的 PDF 輸出還需要在內部提供 OCR 文字層字型。
完整設定請參閱[自行架設](/zh-TW/self-hosting/)，包括 `VITE_OCR_FONT_BASE_URL`、內建的 `ocr-fonts/` 目錄，以及更新後的離線隔離工作流程。
