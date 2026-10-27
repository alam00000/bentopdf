---
title: Word 转 PDF
description: 在浏览器中将 Word 文档（DOC、DOCX）、ODT 和 RTF 文件转换为 PDF，并完整保留格式。
---

# Word 转 PDF

将 Microsoft Word 文档及兼容格式转换为 PDF。该工具使用基于浏览器的 LibreOffice 引擎，可处理 DOC、DOCX、ODT 和 RTF 文件，并在输出中保留格式、表格、图片、页眉、页脚和样式。

## 支持的格式

| 格式              | 扩展名  |
| :---------------- | :------ |
| Word（现代）      | `.docx` |
| Word（旧版）      | `.doc`  |
| OpenDocument 文本 | `.odt`  |
| 富文本格式        | `.rtf`  |

## 工作原理

1. 点击上传区域，或拖放您的 Word 文档。可以一次选择多个文件。
2. 查看并管理文件列表。
3. 点击**转换为 PDF**。LibreOffice 引擎会在首次使用时加载（进度指示器会显示初始化状态），然后依次转换每个文件。
4. 单个文件会直接下载为 PDF。多个文件会打包为 `word-converted.zip`。

## 选项

此工具没有额外设置。LibreOffice 引擎使用其默认的 PDF 导出配置生成输出。

## 输出

| 输入数量 | 输出                                                     |
| :------- | :------------------------------------------------------- |
| 1 个文件 | 下载单个 PDF（原文件名加 `.pdf` 扩展名）                 |
| 2 个以上 | ZIP 压缩包（`word-converted.zip`），每个文件对应一个 PDF |

## 使用场景

- 在提交求职申请之前，将简历或求职信从 DOCX 转换为 PDF
- 批量将一组合同或方案转换为 PDF，交付给客户
- 将旧版 `.doc` 文件转为现代 PDF，便于长期归档
- 将 Google Docs 中协作的文档（导出为 DOCX）转换为 PDF
- 从自动生成文档所用的 Word 模板制作可直接打印的 PDF

## 提示

- LibreOffice 引擎每个会话只下载一次并缓存。首次转换需要几秒钟的加载时间，之后的转换会快得多。
- 复杂格式（宏、ActiveX 控件、高级 SmartArt）可能无法完美转换。标准文档元素，如文本、表格、图片、页眉和脚注，可以可靠转换。
- 由于此工具也接受 ODT 和 RTF，您可以把它当作所有文字处理格式的一站式转换器。

## 相关工具

- [ODT 转 PDF](./odt-to-pdf)
- [RTF 转 PDF](./rtf-to-pdf)
- [Excel 转 PDF](./excel-to-pdf)
- [PowerPoint 转 PDF](./powerpoint-to-pdf)
