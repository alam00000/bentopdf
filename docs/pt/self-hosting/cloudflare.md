# Implantação no Cloudflare Pages

O [Cloudflare Pages](https://pages.cloudflare.com) oferece hospedagem estática rápida e global com largura de banda ilimitada.

## Implantação Rápida

1. Acesse o [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Clique em "Create a project"
3. Conecte seu repositório do GitHub

## Configuração de Build

| Configuração           | Valor           |
| ---------------------- | --------------- |
| Framework preset       | Nenhum          |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Variáveis de Ambiente

Adicione estas em Settings → Environment variables:

| Variável                | Valor                                               |
| ----------------------- | --------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                |
| `SIMPLE_MODE`           | `false` (opcional)                                  |
| `VITE_BRAND_NAME`       | Nome de marca personalizado (opcional)              |
| `VITE_BRAND_LOGO`       | Caminho do logotipo relativo a `public/` (opcional) |
| `VITE_FOOTER_TEXT`      | Texto personalizado de rodapé/copyright (opcional)  |
| `VITE_DEFAULT_LANGUAGE` | Idioma padrão da interface, p. ex. `fr` (opcional)  |

## Arquivo de Configuração

Crie `_headers` na sua pasta `public`:

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning Importante
Os cabeçalhos `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy` são necessários para as conversões de Word/ODT/Excel/PowerPoint para PDF. Sem eles, o `SharedArrayBuffer` fica indisponível e o mecanismo LibreOffice WASM não consegue inicializar.
:::

Crie `_redirects` para o roteamento SPA:

```
/*    /index.html   200
```

## Domínio Personalizado

1. Acesse seu projeto no Pages
2. Clique em "Custom domains"
3. Adicione seu domínio
4. O Cloudflare configura o DNS automaticamente se o domínio estiver no Cloudflare

## Vantagens

- **Largura de banda ilimitada e gratuita**
- **CDN global** com mais de 300 locais de borda
- **HTTPS automático**
- **Implantações de pré-visualização** para pull requests
- **Builds rápidos**

## Solução de Problemas

### Upload de Arquivos Grandes

O Cloudflare Pages aceita arquivos de até 25 MB. Os módulos WASM devem funcionar bem, mas se você atingir os limites, considere:

```bash
# Split large files during build
npm run build
```

### Limites de Tamanho do Worker

Se você usa o Cloudflare Workers para roteamento avançado, observe o limite de 1 MB nos planos gratuitos.

## Worker de Proxy CORS (para Assinaturas Digitais)

A ferramenta de Assinatura Digital exige um proxy CORS para buscar cadeias de certificados. Implante o worker incluído:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Recursos de Segurança

| Recurso                          | Descrição                              |
| -------------------------------- | -------------------------------------- |
| **Restrições de URL**            | Apenas URLs de certificados permitidas |
| **Limite de Tamanho de Arquivo** | Máx. 10MB por requisição               |
| **Limitação de Taxa**            | 60 req/IP/min (requer KV)              |
| **Bloqueio de IP Privado**       | Bloqueia localhost e IPs internos      |

### Ativar Limitação de Taxa

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Compile com a URL do Proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Ou com Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Observação:** Veja o [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) para configurar a assinatura HMAC.
