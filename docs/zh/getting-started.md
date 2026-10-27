# 快速入门

欢迎使用 BentoPDF！本指南将帮助您快速上手。

## 什么是 BentoPDF？

BentoPDF 是一款免费、开源、隐私优先的 PDF 工具箱，**完全在浏览器中运行**。您的文件不会离开您的设备，所有处理都通过 WebAssembly (WASM) 技术在本地完成。

## 快速开始

### 方式 1：使用托管版本

访问 [bentopdf.com](https://www.bentopdf.com) 即可立即使用 BentoPDF，无需安装。

### 方式 2：使用 Docker 自托管

> [!IMPORTANT]
> Office 文件转换需要 `SharedArrayBuffer`，这需要同时满足：
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - 安全上下文
>
> `http://localhost` 可用于本地测试，因为浏览器将环回地址视为可信。`http://192.168.x.x` 等局域网 IP 通常不被视为可信，因此从网络中的其他设备访问时，Word/Excel/PowerPoint 转换需要使用 HTTPS。

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF 提供两种构建版本：**自托管版本**（`bentopdf-simple`，上文使用的版本）适用于内部/团队/组织部署；**商业版本**（`bentopdf:latest`）由 bentopdf.com 自身使用，也供持有商业许可、运行面向公众部署的用户使用。两者的 PDF 工具完全相同，商业版本额外包含 bentopdf.com 的首页横幅、FAQ、用户评价和页脚。如果拿不准，请使用自托管版本。

然后在浏览器中打开 `http://localhost:3000`。

> [!NOTE]
> 如果您要准备离线隔离（air-gapped）的 OCR 部署，除了 Tesseract worker、核心运行时和 traineddata 文件外，还必须在内部托管 OCR 文本层字体。完整的设置步骤见[自托管](/zh/self-hosting/)，其中包括 `VITE_OCR_FONT_BASE_URL` 和随附的 `ocr-fonts/` 目录。

### 方式 3：从源码构建

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 功能一览

| 类别            | 工具                                                   |
| --------------- | ------------------------------------------------------ |
| **转换为 PDF**  | Word、Excel、PowerPoint、图片、Markdown、EPUB、MOBI 等 |
| **从 PDF 转换** | JPG、PNG、文本、Excel、SVG 等                          |
| **编辑与批注**  | 签名、高亮、涂黑、填写表单、添加印章                   |
| **整理**        | 合并、拆分、旋转、删除页面、重新排序                   |
| **优化**        | 压缩、修复、扁平化、OCR                                |
| **安全**        | 加密、解密、移除限制                                   |

## 浏览器支持

BentoPDF 在现代浏览器上表现最佳：

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## 下一步

- [浏览所有工具](/zh/tools/)
- [自托管 BentoPDF](/zh/self-hosting/)
- [参与项目贡献](/zh/contributing)
