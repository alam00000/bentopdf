# Implantar no Netlify

O [Netlify](https://netlify.com) oferece uma excelente hospedagem de sites estáticos, com um plano gratuito generoso.

## Implantação com Um Clique

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Implantação Manual

### Passo 1: Conecte o Repositório

1. Faça login no [Netlify](https://app.netlify.com)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte sua conta do GitHub
4. Selecione seu fork do BentoPDF

### Passo 2: Configure as Opções de Compilação

| Configuração      | Valor           |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Passo 3: Implante

Clique em "Deploy site" e aguarde a compilação.

## Arquivo de Configuração

Crie o `netlify.toml` na raiz do seu projeto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning Importante
Os cabeçalhos `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy` são necessários para as conversões de Word/ODT/Excel/PowerPoint para PDF. Sem eles, o `SharedArrayBuffer` fica indisponível e o mecanismo LibreOffice WASM não consegue inicializar.

Os cabeçalhos `Content-Encoding: gzip` nos arquivos `.wasm.gz` e `.data.gz` instruem o navegador a descompactá-los automaticamente. Sem eles, o navegador recebe bytes gzip brutos e a compilação do WASM falha.
:::

## Variáveis de Ambiente

Defina estas em Site settings → Environment variables:

| Variável                | Descrição                                                            |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Defina como `true` para uma compilação mínima                        |
| `VITE_BRAND_NAME`       | Nome de marca personalizado (substitui "BentoPDF")                   |
| `VITE_BRAND_LOGO`       | Caminho do logotipo relativo a `public/` (ex.: `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texto personalizado de rodapé/direitos autorais                      |
| `VITE_DEFAULT_LANGUAGE` | Idioma padrão da interface (ex.: `fr`, `de`, `es`)                   |

## Domínio Personalizado

1. Acesse Site settings → Domain management
2. Clique em "Add custom domain"
3. Siga as instruções de configuração de DNS

## Large Media

Para arquivos WASM grandes, considere ativar o [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Solução de Problemas

### Conversão de Word/ODT/Excel para PDF Travada em 55%

Se as conversões de documentos travarem em 55%, abra o Console do DevTools e verifique:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Se `crossOriginIsolated` for `false`, os cabeçalhos COEP/COOP do seu `netlify.toml` não estão sendo aplicados. Confirme que o arquivo está na raiz do projeto e implante novamente.

Se você vir `expected magic word 00 61 73 6d, found 1f 8b 08 08` no console, os arquivos `.wasm.gz` estão sem os cabeçalhos `Content-Encoding: gzip`. Confirme que os blocos `[[headers]]` de `soffice.wasm.gz` e `soffice.data.gz` estão no seu `netlify.toml`.

### A Compilação Falha

Verifique a compatibilidade da versão do Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Carregamento Inicial Lento

Ative a otimização de ativos em Site settings → Build & deploy → Asset optimization.
