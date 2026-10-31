---
title: PDF 转 Markdown
description: 将 PDF 文档转换为 Markdown 格式，可选提取图片。支持批量转换多个文件。
---

# PDF 转 Markdown

将 PDF 文件转换为 Markdown (`.md`) 格式，保留标题、段落、列表和基本格式。可选择提取并包含嵌入的图片。支持单个和批量转换。由 PyMuPDF 提供支持。

## 使用方法

1. 点击拖放区域或将文件拖到其上以上传一个或多个 PDF。
2. 可选择切换 **包含图片**，将提取的图片嵌入 Markdown 输出。
3. 点击 **转换** 开始处理。
4. 单个文件会下载为 `filename.md`。多个文件会生成 `markdown-files.zip`。

## 选项

- **包含图片**：勾选后，会提取 PDF 中的嵌入图片并在 Markdown 输出中引用。取消勾选时，仅转换文本内容。

## 输出格式

- **单个文件**：`filename.md`
- **多个文件**：`markdown-files.zip`，每个输入 PDF 对应一个 `.md`。

## 使用场景

- 将 PDF 文档转换为 Markdown，用于 VitePress、Hugo 或 Jekyll 等静态站点生成器。
- 将 PDF 研究论文转换为可编辑的 Markdown，用于 Obsidian 等笔记应用。
- 将旧版 PDF 知识库迁移为对 Git 友好的文本格式。
- 从 PDF 电子书中提取结构化内容以便重新排版。

## 小技巧

- 当 PDF 包含对内容至关重要的图表或插图时，包含图片选项很有用。对于以文本为主的文档，请禁用它以保持输出整洁。
- 带有侧边栏、脚注或多栏文本的复杂布局可能会生成不完美的 Markdown。请根据需要检查并调整输出。
- 如需不带任何格式的原始文本，请改用 [PDF 转文本](./pdf-to-text)。

## 相关工具

- [PDF 转文本](./pdf-to-text)
- [PDF 转 Word](./pdf-to-word)
- [为 AI 准备 PDF](./prepare-pdf-for-ai)
