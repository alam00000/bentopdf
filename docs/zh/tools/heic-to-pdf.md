---
title: HEIC 转 PDF
description: 在浏览器中将 iPhone 和 iPad 的 HEIC 和 HEIF 图片转换为 PDF 格式。
---

# HEIC 转 PDF

将 HEIC/HEIF 图片转换为 PDF。自 iOS 11 起，HEIC 就是 iPhone 和 iPad 的默认照片格式。借助此工具，您无需安装任何桌面软件，也无需将文件上传到服务器，就能把这些照片变成 PDF。

## 支持的格式

| 格式 | 扩展名  |
| :--- | :------ |
| HEIC | `.heic` |
| HEIF | `.heif` |

## 使用方法

1. 点击上传区域或将 HEIC/HEIF 文件拖放进来。
2. 查看文件列表，移除不需要的文件。
3. 点击 **转换为 PDF**。结果会以 `from_heic.pdf` 下载。

每个 HEIC 文件都使用 heic2any 库解码，并以 92% 的质量转换为 PNG。随后使用 pdf-lib 将 PNG 嵌入 PDF，每张图片独占一页，保持完整分辨率。

## 选项

此工具不提供额外设置。HEIC 图片在嵌入前以高质量 (0.92) 转换为 PNG。

## 使用场景

- 用 iPhone 照片创建 PDF，附在保险理赔申请或报告中
- 将房地产房源的 HEIC 照片转换为一份可打印的文档
- 将 iPad 截图（HEIF 格式）变成可分享的 PDF
- 批量转换度假照片，制作旅行日志

## 小贴士

- HEIC 解码完全在浏览器中使用 WebAssembly 完成。解码器加载期间，首次转换可能需要稍等片刻。
- 如果您需要混合 HEIC 与其他图片格式（JPG、PNG 等），请使用 [图片转 PDF](./image-to-pdf) 工具，它可以同时处理 HEIC 和所有其他格式。
- iPhone 的 HEIC 文件通常包含 EXIF 数据，其中有 GPS 坐标。PDF 输出不会保留这些元数据。

## 相关工具

- [图片转 PDF](./image-to-pdf)
- [JPG 转 PDF](./jpg-to-pdf)
- [PNG 转 PDF](./png-to-pdf)
