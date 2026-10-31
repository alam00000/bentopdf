---
title: VSD 转 PDF
description: 在浏览器中将 Microsoft Visio (VSD/VSDX) 图表转换为 PDF。免费、私密，无需 Visio。
---

# VSD 转 PDF

无需安装 Visio，即可将 Microsoft Visio 图表转换为 PDF。VSD 和 VSDX 文件包含流程图、组织结构图、网络图和平面图，大多数人无法打开。此工具会将它们渲染为简洁的 PDF，可在任何设备上查看。

## 支持的格式

| 格式         | 扩展名  | 说明                                 |
| :----------- | :------ | :----------------------------------- |
| Visio 二进制 | `.vsd`  | 旧版 Visio 格式（Visio 2003 及更早） |
| Visio XML    | `.vsdx` | 现代 Visio 格式（Visio 2013+）       |

## 工作原理

1. 点击上传区域，或拖放您的 VSD 或 VSDX 文件。两种格式可以在同一批次中混用。
2. 查看文件列表。使用垃圾桶图标移除不需要的条目，或使用**添加更多文件**添加更多图表。
3. 点击**转换为 PDF**。基于 LibreOffice 的引擎会在浏览器中加载，并将每个图表渲染为 PDF，保留形状、连接线、标签和页面布局。
4. 单个图表会直接下载为 PDF。多个文件会生成名为 `vsd-to-pdf.zip` 的 ZIP 压缩包。

## 选项

无需任何配置。转换器会遵循 Visio 文档原有的页面大小和方向。

## 使用场景

- 在没有 Visio 许可证时查看同事发来的 Visio 图表
- 将网络图或架构图以 PDF 形式加入项目文档
- 打印组织结构图或流程图，作为会议资料
- 将旧版 Visio 的 VSD 文件归档为面向未来的格式

## 提示

- 多页 Visio 文档会生成多页 PDF，每个 Visio 页面对应一个 PDF 页面。
- VSDX 文件（基于 XML 的现代格式）的转换保真度通常高于较旧的 VSD 二进制文件。
- LibreOffice 引擎每个会话只加载一次。首次转换需要稍等片刻，之后的文件会更快。

## 相关工具

- [ODG 转 PDF](./odg-to-pdf)
- [PUB 转 PDF](./pub-to-pdf)
- [PSD 转 PDF](./psd-to-pdf)
