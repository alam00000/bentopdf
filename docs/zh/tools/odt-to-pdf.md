---
title: ODT 转 PDF
description: 使用 LibreOffice 驱动的引擎，在浏览器中将 OpenDocument 文本 (ODT) 文件转换为 PDF 格式。
---

# ODT 转 PDF

将 OpenDocument 文本文件转换为 PDF。ODT 是 LibreOffice Writer、Apache OpenOffice 和其他开源文字处理软件的原生格式。此工具使用浏览器中的 LibreOffice 引擎，生成保留格式、表格、图片和样式的精确转换结果。

## 支持的格式

| 格式              | 扩展名 |
| :---------------- | :----- |
| OpenDocument 文本 | `.odt` |

## 使用方法

1. 点击上传区域或拖放一个或多个 ODT 文件。
2. 查看文件列表。可添加更多文件或移除不需要的文件。
3. 点击 **转换为 PDF**。LibreOffice 引擎会先初始化（进度指示器显示加载状态），然后转换每个文件。
4. 单个文件会直接下载为 PDF。多个文件会打包为 `odt-converted.zip`。

## 选项

此工具没有额外配置。转换会尽可能保留原始文档的格式。

## 输出

| 输入数量 | 输出                                                    |
| :------- | :------------------------------------------------------ |
| 1 个文件 | 下载单个 PDF（例如 `document.pdf`）                     |
| 2 个以上 | ZIP 压缩包（`odt-converted.zip`），每个文件对应一个 PDF |

## 使用场景

- 将 LibreOffice Writer 文档转换为 PDF，以便分享给 Microsoft Office 用户
- 从用 OpenDocument 格式撰写的学术论文生成可直接打印的 PDF
- 批量将一批 ODT 模板转换为 PDF 用于分发
- 从自动文档生成系统创建的 ODT 文件生成 PDF

## 小技巧

- LibreOffice 引擎在首次使用时加载，并会缓存以供后续转换使用。首次加载需要几秒钟，之后转换会很快。
- 包含嵌入式 OLE 对象或特殊字体的复杂文档，渲染效果可能与桌面版 LibreOffice 略有不同。批量转换前请先用样本测试。
- 对于 Word 文档（`.doc`、`.docx`），请改用 [Word 转 PDF](./word-to-pdf) 工具，它同样使用 LibreOffice 引擎，但可直接接受 Microsoft 格式。

## 相关工具

- [Word 转 PDF](./word-to-pdf)
- [RTF 转 PDF](./rtf-to-pdf)
- [文本转 PDF](./txt-to-pdf)
