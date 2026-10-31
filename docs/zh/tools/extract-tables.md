---
title: 提取 PDF 表格
description: 检测并提取 PDF 文档中的表格。可按单个表格导出为 CSV、JSON 或 Markdown。
---

# 提取 PDF 表格

检测 PDF 中的所有表格，并让您选择导出格式：CSV、JSON 或 Markdown。每个表格都会被单独提取，并附带页面和位置元数据。由 PyMuPDF 的表格检测引擎提供支持。

## 使用方法

1. 点击拖放区域或将文件拖到其上，上传 PDF。
2. 选择您偏好的 **导出格式**：CSV、JSON 或 Markdown。
3. 点击 **提取** 开始处理。
4. 如果找到一个表格，它会作为单个文件下载。找到多个表格时，会生成每个表格一个文件的 ZIP 压缩包。

## 选项

- **导出格式**：可在以下选项中选择：
  - **CSV**：以逗号分隔的值，对包含逗号、引号或换行符的字段进行了正确的引用处理。适用于电子表格和数据库。
  - **JSON**：数组的数组结构，以 2 个空格缩进格式化输出。适用于程序化使用。
  - **Markdown**：由 PyMuPDF 渲染的竖线分隔表格格式。适用于文档和 README 文件。

## 输出格式

- **单个表格**：`filename_table.csv`（或 `.json` / `.md`）
- **多个表格**：`filename_tables.zip`，其中包含名为 `table_1_page3.csv`、`table_2_page5.csv` 等的文件

## 使用场景

- 从冗长的 PDF 报告中提取特定表格，而无需取出整个文档的数据。
- 获取 Markdown 格式的表格，直接粘贴到 GitHub issue、wiki 或文档中。
- 从 PDF 表格中提取结构化的 JSON 数据，用于 API 集成或脚本。
- 将不同版本的 PDF 表格导出为 CSV 后进行差异比对，从而比较表格。

## 小提示

- 此工具让您按表格逐个控制。如果您只想将所有表格导出到单个 CSV，请使用 [PDF 转 CSV](./pdf-to-csv)。如需完整的 Excel 工作簿，请使用 [PDF 转 Excel](./pdf-to-excel)。
- 跨多页的表格可能会被检测为每页一个独立的表格。您可能需要手动将它们拼接起来。
- 如果没有检测到表格，PDF 可能是扫描图像。请先运行 OCR 以添加文本层。

## 相关工具

- [PDF 转 CSV](./pdf-to-csv)
- [PDF 转 Excel](./pdf-to-excel)
- [PDF 转文本](./pdf-to-text)
