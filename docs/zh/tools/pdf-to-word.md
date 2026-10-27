---
title: PDF 转 Word
description: 将 PDF 文件转换为可编辑的 Word (DOCX) 文档。支持一次批量转换多个 PDF。
---

# PDF 转 Word

将 PDF 文件转换为可编辑的 Word (`.docx`) 文档。工具使用 PyMuPDF 重建文档内容，保留文本、基本格式和布局。支持单个和批量转换。

## 使用方法

1. 点击拖放区域或将文件拖到其上以上传一个或多个 PDF。您可以添加更多文件，或从列表中移除单个文件。
2. 点击 **转换** 开始处理。
3. 单个文件会下载为 `filename.docx`。多个文件会打包为 `converted-documents.zip`。

## 选项

此工具没有可配置的选项。每个 PDF 都使用 PyMuPDF 的内置转换引擎转换为 DOCX。

## 输出格式

- **单个文件**：`filename.docx`
- **多个文件**：`converted-documents.zip`，每个输入 PDF 对应一个 `.docx`。

## 使用场景

- 编辑您收到并需要修改的 PDF 中的文本。
- 将归档的 PDF 报告转换为同事可在 Microsoft Word 或 Google Docs 中编辑的格式。
- 将 PDF 合同或提案中的内容提取到 Word 中进行修订。
- 将旧版 PDF 文档迁移为可编辑格式。

## 小技巧

- 带有多栏文本、嵌入式表单或大量图形的复杂布局可能无法完美转换。请检查输出，并在文字处理软件中调整格式。
- 扫描的 PDF（仅有图像）会生成空的或内容极少的 DOCX 文件。请先对其进行 OCR 以添加文本层。
- 批量模式可高效转换整个文件夹的 PDF，一次上传全部即可。

## 相关工具

- [PDF 转文本](./pdf-to-text)
- [PDF 转 Markdown](./pdf-to-markdown)
- [PDF 工作流构建器](./pdf-workflow)
