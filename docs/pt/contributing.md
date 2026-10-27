# Contribuindo

Obrigado pelo seu interesse em contribuir com o BentoPDF! Este guia vai ajudar você a começar.

## Primeiros Passos

### Pré-requisitos

- Node.js 18+
- npm 9+
- Git

### Configuração

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Estrutura do Projeto

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

## Adicionando uma Nova Ferramenta

### Passo 1: Crie o Arquivo de Lógica

Crie `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Passo 2: Crie a Página HTML

Crie `src/pages/your-tool.html` seguindo os modelos de ferramentas existentes.

### Passo 3: Registre a Ferramenta

Adicione em `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Passo 4: Adicione à Configuração de Build

Adicione a página ao `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Passo 5: Adicione as Traduções

Adicione entradas a todos os arquivos de idioma em `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Estilo de Código

- Use TypeScript para todo código novo
- Siga os padrões existentes para manter a consistência
- Execute `npm run format` antes de fazer commit
- Sem comentários no código de produção (os comentários são removidos durante o build)

## Processo de Pull Request

1. Crie uma branch de funcionalidade: `git checkout -b feature/your-feature`
2. Faça suas alterações
3. Teste com cuidado: `npm run build`
4. Envie um PR com uma descrição clara

## Tradução

Veja [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) para adicionar novos idiomas.

## Contrato de Licença de Contribuidor

Antes que seu PR possa ser mesclado, você precisará assinar nosso CLA:

- [CLA Individual (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA Corporativo (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Obtendo Ajuda

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Comunidade no Discord](https://discord.gg/Bgq3Ay3f2w)

## Licença

O BentoPDF tem licenciamento duplo:

- **AGPL-3.0** para projetos de código aberto em que você compartilha todo o seu código-fonte publicamente
- **Licença Comercial** para aplicações proprietárias/de código fechado - [Obtenha a Licença Vitalícia por $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Ao contribuir, você concorda que suas contribuições serão licenciadas sob esses termos.
