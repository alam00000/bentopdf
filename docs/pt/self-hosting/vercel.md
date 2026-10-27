# Implantar no Vercel

O [Vercel](https://vercel.com) oferece a experiência de implantação mais simples para sites estáticos.

## Implantação com Um Clique

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Implantação Manual

### Passo 1: Faça um Fork do Repositório

Faça um fork de [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) para sua conta do GitHub.

### Passo 2: Importe no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Selecione seu repositório com o fork
3. Configure o projeto:

| Configuração     | Valor           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Passo 3: Variáveis de Ambiente (Opcional)

Adicione estas se necessário:

| Variável                | Descrição                                                            |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Defina como `true` para uma interface mínima                         |
| `VITE_BRAND_NAME`       | Nome de marca personalizado (substitui "BentoPDF")                   |
| `VITE_BRAND_LOGO`       | Caminho do logotipo relativo a `public/` (ex.: `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Texto personalizado de rodapé/direitos autorais                      |
| `VITE_DEFAULT_LANGUAGE` | Idioma padrão da interface (ex.: `fr`, `de`, `es`)                   |

### Passo 4: Implante

Clique em "Deploy" e aguarde a conclusão da compilação.

## Domínio Personalizado

1. Acesse as configurações do seu projeto
2. Navegue até "Domains"
3. Adicione seu domínio personalizado
4. Configure o DNS conforme as instruções

## Limitações

::: warning Arquivos Grandes
As funções serverless do Vercel têm um limite de 50MB. Como o BentoPDF é um site estático, isso não deve afetar você, mas os módulos WASM são grandes (~100MB no total). Garanta que eles sejam servidos a partir da pasta `/public`.
:::

## Solução de Problemas

### Tempo Limite da Compilação

Se a compilação exceder o tempo limite, tente:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 ao Atualizar a Página

Adicione um `vercel.json` para o roteamento de SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Conversão de Word/ODT/Excel para PDF Não Funciona

As conversões do LibreOffice WASM exigem `SharedArrayBuffer`, que precisa destes cabeçalhos de resposta em todas as páginas:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Os arquivos pré-comprimidos `.wasm.gz` e `.data.gz` também precisam de `Content-Encoding: gzip` para que o navegador os descompacte.

Adicione isto ao seu `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Para verificar, abra o Console do DevTools e execute `console.log(window.crossOriginIsolated)`. Deve retornar `true`.
