---
title: PDF 转 JSON
description: 使用 CPDF 将 PDF 文件转换为结构化 JSON 格式。将 PDF 内部结构导出为机器可读的 JSON 数据。
---

# PDF 转 JSON

将一个或多个 PDF 文件转换为 JSON 格式。工具使用 CPDF (Coherent PDF) 将每个 PDF 的内部结构序列化为机器可读的 JSON 表示。输出始终以 ZIP 压缩包的形式提供。

## 使用方法

1. 使用文件选择器选择一个或多个 PDF 文件。
2. 点击 **转换** 开始处理。转换在后台 Web Worker 中运行。
3. 下载 ZIP 压缩包，其中每个输入 PDF 对应一个 JSON 文件。

状态栏会显示转换和 ZIP 创建阶段的进度。

## 选项

此工具没有可配置的选项。每个 PDF 都会被转换为其完整的 JSON 表示。

## 输出格式

- 一个 `pdfs-to-json.zip` 文件，其中包含每个输入 PDF 对应的 `filename.json`。

JSON 输出表示 PDF 的内部对象结构，包括页面树、字体引用、元数据和内容流。

## 使用场景

- 检查 PDF 的内部结构，用于调试或验证。
- 以编程方式提取结构化元数据和页面属性。
- 将 PDF 结构数据输入自定义处理流水线。
- 通过分析对象树来审核 PDF 文档的合规性。

## 小技巧

- 此工具输出的是原始 PDF 对象结构，而不是提取的文本内容。如果您需要 JSON 格式的页面文本，请改用 [为 AI 准备 PDF](./prepare-pdf-for-ai)。
- 对于纯文本提取，[PDF 转文本](./pdf-to-text) 更直接。
- 结构复杂的大型 PDF 会生成非常大的 JSON 文件。

## 相关工具

- [PDF 转文本](./pdf-to-text)
- [为 AI 准备 PDF](./prepare-pdf-for-ai)
- [提取 PDF 表格](./extract-tables)
