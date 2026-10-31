---
title: PSD 转 PDF
description: 在浏览器中将 Photoshop（PSD）文件转换为 PDF。免费、私密，无需 Adobe 软件。
---

# PSD 转 PDF

将 Adobe Photoshop PSD 文件转换为 PDF 文档。PSD 是 Photoshop 的原生格式，通常需要昂贵的 Adobe 软件才能打开。此工具会将 PSD 文件的合并图像以完整分辨率渲染为 PDF 页面。

## 支持的格式

| 格式            | 扩展名 | 说明                 |
| :-------------- | :----- | :------------------- |
| Adobe Photoshop | `.psd` | 渲染合并后的复合图像 |

## 工作原理

1. 点击上传区域或将 PSD 文件拖放到此处。支持多个文件。
2. 查看文件列表。使用垃圾桶图标移除不需要的文件，或使用**添加更多文件**加入更多文件。
3. 点击**转换为 PDF**。PyMuPDF 引擎会读取 PSD 文件，并以原始分辨率将合并图像嵌入 PDF 页面。
4. 单个 PSD 生成一个 PDF。上传多个 PSD 文件时，它们会合并为一个名为 `psd_to_pdf.pdf` 的多页 PDF，每个 PSD 成为其中一页。

## 选项

无需任何设置。转换器使用 PSD 文件中合并后的图像数据。

## 使用场景

- 无需打开 Photoshop 即可预览设计稿
- 向没有 Adobe Creative Suite 的客户发送设计样稿
- 打印 PSD 文件中的高分辨率作品
- 用多个 PSD 设计文件创建 PDF 作品集，每个文件成为单个文档中的一页

## 提示

- 转换渲染的是 PSD 的合并（扁平化）视图。单独的图层、调整图层和图层效果不会作为独立元素保留在 PDF 中。
- 多个 PSD 文件会合并为一个多页 PDF，而不是单独的 PDF。这对于制作作品集或样册很有用。
- 分辨率很高的 PSD 文件（300 DPI 以上的印刷文件）会生成较大的 PDF。该工具会保留完整分辨率。

## 相关工具

- [图片转 PDF](./image-to-pdf)
- [PNG 转 PDF](./png-to-pdf)
- [VSD 转 PDF](./vsd-to-pdf)
