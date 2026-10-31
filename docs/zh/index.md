---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: '免费开源的 PDF 工具'
  tagline: 完全在浏览器中处理 PDF。无需上传，无需服务器，彻底保护隐私。
  actions:
    - theme: brand
      text: 快速入门
      link: /zh/getting-started
    - theme: alt
      text: 查看工具
      link: /zh/tools/
    - theme: alt
      text: 自托管
      link: /zh/self-hosting/
    - theme: alt
      text: 商业许可
      link: /zh/licensing

features:
  - icon: 🔒
    title: 100% 私密
    details: 您的文件不会离开您的设备。所有处理都通过 WebAssembly 在浏览器本地完成。
  - icon: ⚡
    title: 快速且免费
    details: 无需注册，无限制，无水印。永久免费，无限量处理 PDF。
  - icon: 🛠️
    title: 50+ 款工具
    details: 转换、编辑、合并、拆分、压缩、签名、OCR 等，所需功能一应俱全。

  - icon: 🌐
    title: 可自托管
    details: 部署在您自己的基础设施上。支持 Docker、Vercel、Netlify、AWS，也可部署在完全离线隔离的环境中，配套自托管的 OCR worker、语言数据和文本层字体。
---

## 离线 OCR

如果您在离线隔离或无网络的环境中自托管 BentoPDF，OCR 所需的不仅仅是 Tesseract worker 和 traineddata 文件。要输出可搜索的 PDF，还需要在内部提供 OCR 文本层字体。
完整设置请参阅[自托管](/zh/self-hosting/)，其中包括 `VITE_OCR_FONT_BASE_URL`、随附的 `ocr-fonts/` 目录以及更新后的离线隔离工作流程。
