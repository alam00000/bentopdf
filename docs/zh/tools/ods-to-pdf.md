---
title: ODS 转 PDF
description: 在浏览器中将 LibreOffice Calc (ODS) 电子表格转换为 PDF。免费、私密、无需注册。
---

# ODS 转 PDF

将 OpenDocument 电子表格文件转换为 PDF。ODS 是 LibreOffice Calc 的原生格式，也是 Google Sheets 常见的导出格式。此工具会把电子表格的数据、格式和图表渲染为分页 PDF，方便打印或分享。

## 支持的格式

| 格式                  | 扩展名 | 备注                                  |
| :-------------------- | :----- | :------------------------------------ |
| OpenDocument 电子表格 | `.ods` | LibreOffice Calc / Google Sheets 导出 |

## 使用方法

1. 点击上传区域或拖放 ODS 文件，支持多个文件。
2. 查看文件列表。使用垃圾桶图标移除文件，或点击 **添加更多文件** 扩充批次。
3. 点击 **转换为 PDF**。基于 LibreOffice 的引擎会在浏览器中加载，并将每个电子表格渲染为 PDF 页面。
4. 单个电子表格会直接下载为 PDF。多个文件会打包为 `ods-to-pdf.zip`。

## 选项

无需任何配置。转换器会将电子表格现有的打印布局、单元格格式和列宽应用到 PDF 输出中。

## 使用场景

- 将 LibreOffice Calc 的预算或报告分享给只接受 PDF 的人
- 打印以 ODS 格式下载的 Google Sheets 导出文件
- 以不可编辑的格式归档财务记录
- 以固定版式文档的形式提交基于 ODS 的表单或工时表

## 小技巧

- 如果电子表格包含多个工作表，所有工作表都会包含在 PDF 输出中。
- 非常宽的电子表格可能会在水平方向跨越多个 PDF 页面。如果版面很重要，建议在转换前先调整源文件中的列宽。
- LibreOffice 引擎在首次使用时初始化。同一会话中后续的转换会更快。

## 相关工具

- [ODG 转 PDF](./odg-to-pdf)
- [ODP 转 PDF](./odp-to-pdf)
- [XML 转 PDF](./xml-to-pdf)
