---
title: JSON 转 PDF
description: 从 BentoPDF 的 JSON 格式重建 PDF 文件。将 JSON 导出文件转换回原始 PDF 文档。
---

# JSON 转 PDF

从之前由 BentoPDF 的 **PDF 转 JSON** 工具创建的 JSON 文件中重建 PDF 文档。这是一个往返转换工具：它读取 PDF 的结构化 JSON 表示，并重建原始文档。

::: warning
此工具只接受由 BentoPDF 的 PDF 转 JSON 转换器生成的 JSON 文件。来自 API、数据库或其他工具的标准 JSON 文件不受支持。
:::

## 支持的格式

| 输入    | 说明                                            |
| :------ | :---------------------------------------------- |
| `.json` | 由 BentoPDF 的 PDF 转 JSON 工具导出的 JSON 文件 |

## 使用方法

1. 点击上传区域或拖放一个或多个 JSON 文件。
2. 文件列表会显示每个已选文件及其大小。
3. 点击 **转换为 PDF**。该工具使用 Web Worker 和 CPDF 引擎处理所有文件。
4. 输出会下载为 `jsons-to-pdf.zip`，其中每个输入 JSON 文件对应一个 PDF。

转换在后台 Web Worker 中运行，因此即使处理大文件，界面也能保持响应。

## 选项

此工具没有可配置的选项。输出的 PDF 完全由 JSON 结构决定。

## 输出

转换多个 JSON 文件时，结果会以 ZIP 压缩包形式提供。每个 PDF 都以其源 JSON 文件命名（例如 `report.json` 会变为 `report.pdf`）。

## 使用场景

- 从基于 JSON 的备份或归档流程中还原 PDF
- 将 PDF 转为 JSON 进行检查，再转回 PDF
- 在以编程方式修改 JSON 结构后重建文档
- 通过转换回 PDF，验证 PDF 转 JSON 的导出是否捕获了全部文档内容

## 小贴士

- 如果您需要将任意 JSON 数据（如 API 响应或配置文件）转换为格式化的 PDF，[文本转 PDF](./txt-to-pdf) 工具更合适。将 JSON 作为文本粘贴进去，它会以合适的格式渲染。
- 此工具要求 CPDF WebAssembly 引擎可用。自托管实例需要配置 CPDF WASM 文件。

## 相关工具

- [文本转 PDF](./txt-to-pdf)
- [Markdown 转 PDF](./markdown-to-pdf)
- [CSV 转 PDF](./csv-to-pdf)
