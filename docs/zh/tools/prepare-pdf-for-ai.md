---
title: 为 AI 准备 PDF
description: 将 PDF 内容提取为针对 LLM 和 LlamaIndex 等 AI 管道优化的结构化 JSON。支持批量处理。
---

# 为 AI 准备 PDF

从 PDF 文件中提取内容，并将其整理为适合大型语言模型（LLM）和 LlamaIndex 等 AI 框架摄取的 JSON。每一页的内容都会被提取并组织成结构化格式，可直接用于 RAG 管道、聊天机器人或语义搜索系统。

## 工作原理

1. 点击拖放区域或将文件拖到其上，上传一个或多个 PDF。
2. 点击**提取**开始处理。
3. 单个文件会下载为 `filename_llm.json`。多个文件会生成 `pdf-for-ai.zip` 压缩包。

此工具使用 PyMuPDF 的 LlamaIndex 集成来提取带元数据的页面级内容，生成的输出可直接加载到 AI 框架中。

## 选项

此工具没有可配置的选项。所有页面都会提取完整文本和元数据。

## 输出格式

- **单个文件**：`filename_llm.json`
- **多个文件**：`pdf-for-ai.zip`，每个输入 PDF 对应一个 `_llm.json`。

JSON 输出遵循 LlamaIndex 文档模式，包含每页的文本内容和元数据字段。

## 使用场景

- 为检索增强生成（RAG）管道准备 PDF 文档。
- 利用 PDF 档案为 AI 聊天机器人构建可搜索的知识库。
- 将 PDF 报告输入基于 LLM 的分析工作流。
- 为语义搜索和问答系统预处理研究论文。
- 从 PDF 文档集合中创建结构化的训练数据。

## 提示

- 如果只需要不含 AI 专用格式的纯文本提取，请使用 [PDF 转文本](./pdf-to-text)。
- 如果需要保留标题和结构的 Markdown 输出，请使用 [PDF 转 Markdown](./pdf-to-markdown)。
- 扫描版 PDF 的输出会为空或内容极少。请先通过 OCR 添加文本层，再进行提取。

## 相关工具

- [PDF 转文本](./pdf-to-text)
- [PDF 转 Markdown](./pdf-to-markdown)
- [PDF 转 JSON](./pdf-to-json)
