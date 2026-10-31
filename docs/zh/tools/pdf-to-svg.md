---
title: PDF 转 SVG
description: 将 PDF 页面转换为可缩放的 SVG 矢量图形。将文本和形状保留为矢量路径，可无限缩放。
---

# PDF 转 SVG

将 PDF 的每一页转换为 SVG（可缩放矢量图形）文件。与栅格格式不同，SVG 会保留矢量路径、文本和形状，因此输出可缩放到任意大小而不会出现像素化。由 PyMuPDF 提供支持。

## 使用方法

1. 点击拖放区域或将文件拖到其上以上传一个或多个 PDF。您可以添加多个文件并分别管理。
2. 点击 **转换** 处理所有已上传的文件。
3. 单文件单页的转换会下载为独立的 `.svg`。其他情况都会下载为 ZIP 压缩包。

## 选项

此工具没有可配置的选项。每个页面都使用 PyMuPDF 的原生矢量导出转换为 SVG。

## 输出格式

- **单文件，单页**：`filename.svg`
- **单文件，多页**：`filename_svg.zip`，包含 `page_1.svg`、`page_2.svg` 等。
- **多个文件**：`pdf_to_svg.zip`，文件按源文档名称组织。

## 使用场景

- 从 PDF 报告中提取矢量图表、图示或插图，用于网页。
- 在 Inkscape 或 Illustrator 等矢量编辑器中编辑 PDF 页面内容。
- 在响应式网络应用中嵌入可缩放的页面预览。
- 从 PDF 宣传册中提取徽标或图形，同时保持边缘锐利。

## 小技巧

- SVG 最适合包含矢量内容的 PDF。扫描文档或图像较多的 PDF 会生成包含嵌入栅格数据的大型 SVG 文件。
- 对于图像较多的 PDF，如需栅格输出，请改用 [PDF 转 PNG](./pdf-to-png) 或 [PDF 转 JPG](./pdf-to-jpg)。
- 此工具支持批量转换：一次上传多个 PDF，即可一次性全部转换。

## 相关工具

- [PDF 转 PNG](./pdf-to-png)
- [PDF 转 JPG](./pdf-to-jpg)
- [PDF 转 Markdown](./pdf-to-markdown)
