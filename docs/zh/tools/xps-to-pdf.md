---
title: XPS 转 PDF
description: 在浏览器中将 XPS 和 OXPS 文档转换为 PDF 格式。无需上传，无需注册，完全私密。
---

# XPS 转 PDF

将 Microsoft XPS 和 OXPS 文档转换为标准 PDF 文件。XPS（XML Paper Specification）是微软对 PDF 的回应，但各平台对它的支持已日渐减少。此工具让这些文档重新变得人人可读。

## 支持的格式

| 格式 | 扩展名  | 说明                          |
| :--- | :------ | :---------------------------- |
| XPS  | `.xps`  | 原始的 Microsoft XPS 格式     |
| OXPS | `.oxps` | Open XPS，ECMA-388 标准的变体 |

## 工作原理

1. 点击上传区域，或拖放您的 XPS/OXPS 文件。可以一次选择多个文件。
2. 查看文件列表。使用垃圾桶图标移除单个文件，或点击**添加更多文件**追加文档。
3. 点击**转换为 PDF**。PyMuPDF 引擎会在您的浏览器中本地处理每个文档。
4. 单个文件会直接下载为 PDF。多个文件会打包为名为 `xps-converted.zip` 的 ZIP 压缩包。

## 选项

此工具执行直接的格式转换，无需额外配置。输出会保留 XPS 源文件中的原始页面尺寸、矢量图形、字体和图片。

## 使用场景

- 打开从默认使用 XPS 打印驱动的旧 Windows 系统收到的 XPS 文件
- 转换 Windows 10/11 中的 OXPS 文档，以便与 macOS 或 Linux 用户共享
- 将旧的 XPS 文件归档为支持更广泛的格式
- 让基于 XPS 的政府或企业文档可供外部收件人访问

## 提示

- `.xps` 和 `.oxps` 扩展名都会被自动处理，您可以在同一批次中混用。
- 如果原始 XPS 文件由高分辨率打印驱动创建，生成的 PDF 会保持该质量。不会进行重新采样。

## 相关工具

- [Word 转 PDF](./word-to-pdf)
- [XML 转 PDF](./xml-to-pdf)
