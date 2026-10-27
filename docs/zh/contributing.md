# 参与贡献

感谢您有兴趣为 BentoPDF 做出贡献！本指南将帮助您快速上手。

## 开始上手

### 前置条件

- Node.js 18+
- npm 9+
- Git

### 环境搭建

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## 项目结构

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## 添加新工具

### 第 1 步：创建逻辑文件

创建 `src/js/logic/your-tool-page.ts`：

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### 第 2 步：创建 HTML 页面

参照现有的工具模板，创建 `src/pages/your-tool.html`。

### 第 3 步：注册工具

添加到 `src/js/config/tools.ts`：

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### 第 4 步：添加到构建配置

将页面添加到 `vite.config.ts`：

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### 第 5 步：添加翻译

在 `public/locales/` 下的所有语言文件中添加条目：

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## 代码风格

- 所有新代码都使用 TypeScript
- 遵循现有模式以保持一致
- 提交前运行 `npm run format`
- 生产代码中不要写注释（构建时会移除注释）

## Pull Request 流程

1. 创建功能分支：`git checkout -b feature/your-feature`
2. 进行修改
3. 充分测试：`npm run build`
4. 提交 PR 并附上清晰的说明

## 翻译

添加新语言请参阅 [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md)。

## 贡献者许可协议

在您的 PR 被合并之前，需要先签署我们的 CLA：

- [个人 CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [企业 CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## 获取帮助

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord 社区](https://discord.gg/Bgq3Ay3f2w)

## 许可证

BentoPDF 采用双重许可：

- **AGPL-3.0**：适用于公开分享完整源代码的开源项目
- **商业许可**：适用于专有/闭源应用 - [购买终身许可，仅需 $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

贡献代码即表示您同意您的贡献将按上述条款授权。
