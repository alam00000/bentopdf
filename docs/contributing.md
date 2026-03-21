# Contributing

Thank you for your interest in contributing to BentoPDF! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

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

## Adding a New Tool

### Step 1: Create the Logic File

Create `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
    // Your tool logic here
});
```

### Step 2: Create the HTML Page

Create `src/pages/your-tool.html` following the existing tool templates.

### Step 3: Register the Tool

Add to `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Step 4: Add to Build Config

Add the page to `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Step 5: Add Translations

Add entries to all locale files in `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Code Style

- Use TypeScript for all new code
- Follow existing patterns for consistency
- Run `npm run format` before committing
- No comments in production code (comments removed during build)

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly: `npm run build`
4. Submit a PR with a clear description

## Translation

See [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) for adding new languages.

## Contributor License Agreement

Before your PR can be merged, you'll need to sign our CLA:

- [Individual CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Corporate CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Getting Help

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord Community](https://discord.gg/Bgq3Ay3f2w)

## License

BentoPDF is dual-licensed:

- **AGPL-3.0** for open-source projects where you share your full source code publicly
- **Commercial License** for proprietary/closed-source applications - [Get Lifetime License for $49](https://ko-fi.com/s/f32ca4cb75)

By contributing, you agree that your contributions will be licensed under these terms.
