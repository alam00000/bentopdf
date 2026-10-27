---
title: PowerPoint 转 PDF
description: 将 PowerPoint 演示文稿（PPT、PPTX）和 ODP 文件转换为 PDF，并保留幻灯片格式。
---

# PowerPoint 转 PDF

将演示文稿文件转换为 PDF。每张幻灯片都会成为输出文档中的一页，文本、图片、形状和切换效果通过浏览器内的 LibreOffice 引擎渲染。同时支持新版和旧版 PowerPoint 格式，以及 OpenDocument 演示文稿格式。

## 支持的格式

| 格式                  | 扩展名  |
| :-------------------- | :------ |
| PowerPoint（新版）    | `.pptx` |
| PowerPoint（旧版）    | `.ppt`  |
| OpenDocument 演示文稿 | `.odp`  |

## 工作原理

1. 点击上传区域，或将演示文稿文件拖放到此处。
2. 查看文件列表。可根据需要添加或移除文件。
3. 点击**转换为 PDF**。LibreOffice 引擎会在首次使用时加载，然后转换每个文件。
4. 单个文件会直接下载为 PDF。多个文件会打包为 `powerpoint-converted.zip`。

## 选项

此工具没有额外设置。幻灯片按其原始尺寸渲染。

## 输出

| 输入数量 | 输出                                                           |
| :------- | :------------------------------------------------------------- |
| 1 个文件 | 下载单个 PDF（原文件名，扩展名为 `.pdf`）                      |
| 2 个以上 | ZIP 压缩包（`powerpoint-converted.zip`），每个文件对应一个 PDF |

## 使用场景

- 在分享给可能没有 PowerPoint 的观众之前，先将演示文稿转换为 PDF
- 为会议或研讨会制作可打印的幻灯片讲义版本
- 以在所有设备上显示一致的格式归档演示文稿
- 批量将 LibreOffice Impress 的 ODP 演示文稿库转换为 PDF
- 制作用于邮件附件的融资演示文稿 PDF 版本

## 提示

- 幻灯片动画和切换效果不会体现在 PDF 中，每张幻灯片都会被截取为静态页面。
- 嵌入的视频不会出现在输出中。如有需要，请用截图或占位图片替换。
- 默认的 PDF 导出不包含演讲者备注。如果需要备注，请先通过 PowerPoint 原生的“打印备注”视图导出。
- LibreOffice 引擎在首次加载后会被缓存，因此在同一会话中转换第二个演示文稿会快得多。

## 相关工具

- [Word 转 PDF](./word-to-pdf)
- [Excel 转 PDF](./excel-to-pdf)
- [图片转 PDF](./image-to-pdf)
