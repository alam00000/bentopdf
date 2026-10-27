---
title: Excel 转 PDF
description: 将 Excel 电子表格（XLS、XLSX）、ODS 和 CSV 文件转换为 PDF，并保留格式。
---

# Excel 转 PDF

将电子表格文件转换为 PDF。此工具可处理现代 Excel 文件、旧版 XLS 格式、OpenDocument 电子表格，甚至 CSV，全部通过基于浏览器的 LibreOffice 引擎渲染，保留单元格格式、公式（以计算值呈现）、图表和多工作表版式。

## 支持的格式

| 格式                  | 扩展名  |
| :-------------------- | :------ |
| Excel（新版）         | `.xlsx` |
| Excel（旧版）         | `.xls`  |
| OpenDocument 电子表格 | `.ods`  |
| CSV                   | `.csv`  |

## 使用方法

1. 点击上传区域，或拖放您的电子表格文件。
2. 查看文件列表。可添加更多文件或移除不需要的文件。
3. 点击 **转换为 PDF**。LibreOffice 引擎会在首次使用时初始化，然后处理每个文件。
4. 单个文件会直接下载为 PDF。多个文件会以 `excel-converted.zip` 提供。

## 选项

此工具没有额外配置。LibreOffice 引擎根据电子表格的内置设置确定页面布局、缩放和打印区域。

## 输出

| 输入数量 | 输出                                                      |
| :------- | :-------------------------------------------------------- |
| 1 个文件 | 下载单个 PDF（原文件名，扩展名为 `.pdf`）                 |
| 2 个以上 | ZIP 压缩包（`excel-converted.zip`），每个文件对应一个 PDF |

## 使用场景

- 将财务报告或预算从 Excel 转换为 PDF 以便分发
- 根据库存或产品目录电子表格创建可直接打印的 PDF
- 与未安装 Excel 的相关方分享数据分析结果
- 以不可编辑的格式归档季度报告
- 将 LibreOffice Calc 的 ODS 文件转换为 PDF

## 小提示

- 电子表格中嵌入的图表会在 PDF 中渲染。转换前请确保它们在源文件中显示正确。
- 如果电子表格有多个工作表，所有工作表都会包含在 PDF 输出中。
- 对于没有格式的简单 CSV 数据，[CSV 转 PDF](./csv-to-pdf) 工具提供更轻量的转换。当您需要保留格式、图表或多个工作表时，请使用 Excel 转 PDF。

## 相关工具

- [CSV 转 PDF](./csv-to-pdf)
- [Word 转 PDF](./word-to-pdf)
- [PowerPoint 转 PDF](./powerpoint-to-pdf)
