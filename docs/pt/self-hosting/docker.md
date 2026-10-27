# Implantação com Docker / Podman

A maneira mais fácil de hospedar o BentoPDF por conta própria em um ambiente de produção.

> [!IMPORTANT]
> **Cabeçalhos Necessários para a Conversão de Arquivos do Office**
>
> As ferramentas baseadas no LibreOffice (conversão de Word, Excel e PowerPoint) exigem estes cabeçalhos HTTP para dar suporte a `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> A página também precisa ser servida em um contexto seguro. `http://localhost` funciona para testes locais, mas `http://192.168.x.x` ou outros IPs de rede local normalmente não se qualificam, então a conversão do Office por HTTP simples falhará mesmo com os cabeçalhos presentes.
>
> As imagens de contêiner oficiais já incluem esses cabeçalhos. Se você usa um proxy reverso (Traefik, Caddy etc.), garanta que esses cabeçalhos sejam preservados ou adicionados, e use HTTPS para acessos que não sejam de loopback.

> [!TIP]
> **Usuários do Podman:** todos os comandos `docker` funcionam com o Podman substituindo `docker` por `podman` e `docker-compose` por `podman-compose`.

## Início Rápido

> [!TIP]
> O BentoPDF vem em duas versões:
>
> - **Versão Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Todas as ferramentas de PDF, **sem** a parte de marketing (sem hero, FAQ, depoimentos nem rodapé). Use para implantações internas, de equipes e organizações. **Não** é uma versão "lite" com menos recursos.
> - **Versão Comercial**: `ghcr.io/alam00000/bentopdf:latest`. O site de marketing completo, usado pelo próprio bentopdf.com e por titulares de licença comercial que mantêm implantações públicas.
>
> Em caso de dúvida: baixe a versão Self-Hosted.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

Crie o `docker-compose.yml`:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

Execute:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Crie Sua Própria Imagem

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Compile e execute:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Variáveis de Ambiente

| Variável                             | Descrição                                                                                                                                                                                                                         | Padrão                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Compila a variante Self-Hosted (oculta a parte de marketing do bentopdf.com: hero, FAQ, depoimentos e rodapé). Todas as ferramentas de PDF permanecem.                                                                            | `false`                                                        |
| `BASE_URL`                           | Implantar em subdiretório                                                                                                                                                                                                         | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL do módulo WASM do PyMuPDF                                                                                                                                                                                                     | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL do módulo WASM do Ghostscript                                                                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL do módulo WASM do CoherentPDF                                                                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL do script do worker de OCR                                                                                                                                                                                                    | _(vazio; usa a CDN padrão do Tesseract.js)_                    |
| `VITE_TESSERACT_CORE_URL`            | Diretório do runtime principal do OCR                                                                                                                                                                                             | _(vazio; usa a CDN padrão do Tesseract.js)_                    |
| `VITE_TESSERACT_LANG_URL`            | Diretório traineddata do OCR                                                                                                                                                                                                      | _(vazio; usa a CDN padrão do Tesseract.js)_                    |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Idiomas de OCR separados por vírgula exibidos na interface                                                                                                                                                                        | _(vazio; mostra o catálogo completo)_                          |
| `VITE_OCR_FONT_BASE_URL`             | Diretório de fontes da camada de texto do OCR                                                                                                                                                                                     | _(vazio; usa as URLs remotas de fontes Noto)_                  |
| `VITE_DEFAULT_LANGUAGE`              | Idioma padrão da interface                                                                                                                                                                                                        | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nome de marca personalizado                                                                                                                                                                                                       | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Caminho do logotipo relativo a `public/`                                                                                                                                                                                          | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Texto personalizado de rodapé/copyright                                                                                                                                                                                           | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | IDs de ferramentas separados por vírgula a ocultar                                                                                                                                                                                | _(vazio; todas as ferramentas ativadas)_                       |
| `DISABLE_GITHUB_STARS`               | Pula a busca da contagem de estrelas do GitHub ao carregar a página e remove `api.github.com` da CSP. As versões Simple Mode sempre a dispensam.                                                                                  | `false`                                                        |
| `SITE_URL`                           | URL pública gravada nos links canonical, hreflang e sitemap. Mantenha o padrão, a menos que queira que os mecanismos de busca tratem sua implantação como um site próprio.                                                        | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Com um `SITE_URL` personalizado, todas as páginas são marcadas como `noindex` para que sua cópia não concorra com o bentopdf.com nos resultados de busca. Defina como `true` para permitir a indexação pelos mecanismos de busca. | `false`                                                        |

As URLs dos módulos WASM vêm pré-configuradas com padrões de CDN, então todos os recursos avançados funcionam sem configuração. Substitua-as em implantações isoladas da internet (air-gapped) ou hospedadas por conta própria.

### Mecanismos de busca

Por padrão, cada página indica aos mecanismos de busca o bentopdf.com como original, para que sua implantação não apareça como duplicada. Você não precisa mudar nada em uma instância privada ou interna.

- **Manter sua instância fora dos resultados de busca:** execute o contêiner com `-e ROBOTS_NOINDEX=true`. Isso exige apenas uma reinicialização, não uma recompilação.
- **Fazer da sua instância um site próprio nos resultados de busca:** compile com `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Sem `ALLOW_INDEXING=true`, um `SITE_URL` personalizado marca todas as páginas como `noindex`.

### Content-Security-Policy

A imagem do nginx vem com um cabeçalho `Content-Security-Policy` em modo de aplicação. As diretivas `script-src`, `connect-src` e `font-src` da CSP são **geradas em tempo de build** a partir das variáveis de URL `VITE_*` acima: os hosts que você passar via `--build-arg` são adicionados automaticamente à política.

Como resultado:

- Se você substituir `VITE_CORS_PROXY_URL` ou `VITE_WASM_*_URL` em tempo de build, a CSP permite essas origens automaticamente, sem configuração extra.
- Para URLs em `cdn.jsdelivr.net`, o `script-src` permite apenas a pasta exata do pacote com versão, por exemplo `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, e não a CDN inteira. O jsDelivr serve qualquer pacote npm público ou repositório do GitHub, então permitir o host inteiro deixaria qualquer um deles rodar na sua instância. URLs em qualquer outro host são permitidas por origem.
- Se você configurar URLs WASM personalizadas em _tempo de execução_ pela página de Configurações Avançadas do app, essas origens **não** estarão na CSP e o navegador bloqueará as requisições a elas. Isso vale também para uma versão diferente do mesmo pacote em `cdn.jsdelivr.net`, pois só a versão definida em tempo de build é permitida. A configuração em tempo de execução serve para experimentação; para URLs personalizadas permanentes, defina o build arg `VITE_*` correspondente.
- Em implantações air-gapped que substituem os três valores `VITE_WASM_*_URL`, essas pastas de pacote de `cdn.jsdelivr.net` também são removidas da CSP (cada padrão é substituído, não acrescentado). Os padrões do Tesseract OCR em `cdn.jsdelivr.net` permanecem na política até que você defina também os três valores `VITE_TESSERACT_*`. Da mesma forma, definir `VITE_CORS_PROXY_URL` substitui o padrão público `bentopdf-cors-proxy.bentopdf.workers.dev`.

A CSP inclui `'unsafe-eval'` no `script-src` porque o runtime do LibreOffice WASM (usado pelas ferramentas de conversão de Word/Excel/PowerPoint) e a biblioteca de imagens wasm-vips (usada em PDF para TIFF) compilam código interno de despacho via `new Function()`. Removê-lo quebraria essas ferramentas. Se você compila em `SIMPLE_MODE` (sem LibreOffice) e não precisa de PDF para TIFF, pode editar manualmente o `security-headers.conf` gerado para remover `'unsafe-eval'` e obter uma política mais restrita.

Para o OCR, deixe as variáveis `VITE_TESSERACT_*` vazias para usar os recursos online padrão, ou defina as três juntas para OCR hospedado por conta própria/offline. Substituições parciais do OCR são rejeitadas porque o worker, o runtime principal e o diretório traineddata precisam corresponder. Para uma saída de PDF pesquisável totalmente offline, defina também `VITE_OCR_FONT_BASE_URL`, de modo que as fontes da camada de texto do OCR sejam carregadas do seu servidor interno e não das URLs públicas de fontes Noto.

`VITE_DEFAULT_LANGUAGE` define o idioma da interface para quem visita pela primeira vez. Valores aceitos: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Os usuários ainda podem trocar de idioma; isso só muda o padrão.

Exemplo:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Marca Personalizada

Substitua o logotipo, o nome e o texto de rodapé padrão do BentoPDF pelos seus. Coloque seu arquivo de logotipo na pasta `public/` (ou use uma imagem existente) e passe as variáveis de marca em tempo de build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

A marca personalizada funciona tanto no modo completo quanto no Simple Mode, e pode ser combinada com todas as outras opções de build.

### Desativando Ferramentas Específicas

Oculte ferramentas da interface por requisitos de conformidade ou segurança. As ferramentas desativadas são removidas da página inicial, dos resultados de busca, dos atalhos de teclado e do construtor de fluxos de trabalho. O acesso direto pela URL mostra uma página de "ferramenta indisponível".

Os IDs das ferramentas são a URL da página sem `.html`. Por exemplo, se a ferramenta está em `bentopdf.com/edit-pdf.html`, o ID é `edit-pdf`.

#### Encontrando os IDs das Ferramentas

O jeito mais fácil: abra qualquer ferramenta no BentoPDF e olhe a URL. A última parte do caminho (sem `.html`) é o ID da ferramenta.

<details>
<summary>Lista completa de IDs das ferramentas</summary>

**Editar e Anotar:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Converter para PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Converter de PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organizar e Gerenciar:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Otimizar e Reparar:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Segurança:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opção 1: Em tempo de build (build arg do Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Isso embute a lista de desativadas no bundle JavaScript. Mudar exige uma recompilação.

#### Opção 2: Em tempo de execução (config.json)

Monte um arquivo `config.json` no diretório servido, sem precisar recompilar:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Ou com Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Os dois métodos podem ser combinados: as listas são mescladas. Se uma ferramenta aparecer em qualquer uma delas, ela é desativada.

#### Desativando Recursos do Editor

Você também pode desativar recursos específicos dentro do Editor de PDF (p. ex., redação, anotações, formulários) sem desativar a ferramenta de edição inteira. Adicione `editorDisabledCategories` ao seu `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Lista completa de categorias do editor</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Anotação:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Formas:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulário:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Redação:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Documento:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Página:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Painel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Ferramentas:** `tools`, `pan`, `pointer`, `capture`

**Seleção:** `selection`, `selection-copy`

**Histórico:** `history`, `history-undo`, `history-redo`

</details>

As categorias são hierárquicas: desativar uma categoria pai (p. ex., `annotation`) desativa todas as suas filhas.

### Desativando o Contador de Estrelas do GitHub

A barra de navegação mostra a contagem de estrelas do GitHub em tempo real, buscada em `api.github.com` ao carregar a página. É a única requisição externa que não atende a um recurso de PDF. Desative-a em tempo de build para remover o código de busca do bundle e tirar `api.github.com` da Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

As versões Simple Mode (`bentopdf-simple`) sempre dispensam o contador de estrelas; essa opção só é necessária na versão Comercial ou em builds completos personalizados.

### URLs WASM Personalizadas (Air-Gapped / Hospedagem Própria)

> [!IMPORTANT]
> As URLs WASM são embutidas no JavaScript em **tempo de build**. Os arquivos WASM são baixados pelo **navegador do usuário** em tempo de execução: o Docker não os baixa durante o build. Em redes air-gapped, você precisa hospedar os arquivos WASM em um servidor interno que os navegadores consigam alcançar.

**Fluxo de trabalho air-gapped completo:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Use os códigos exibidos por `bash scripts/prepare-airgap.sh --list-ocr-languages`, ou busque pelo nome com `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, em `--ocr-languages`. Ao compilar com um subconjunto restrito de OCR, passe os mesmos códigos para `VITE_TESSERACT_AVAILABLE_LANGUAGES` para que o app mostre apenas os idiomas incluídos. Para uma saída de OCR totalmente offline, hospede também o diretório `ocr-fonts/` incluído e aponte `VITE_OCR_FONT_BASE_URL` para ele.

Defina uma variável como string vazia para desativar esse módulo (os usuários precisarão configurar manualmente em Configurações Avançadas).

## Porta Personalizada

Por padrão, o BentoPDF escuta na porta `8080` dentro do contêiner. Para mudar isso, defina a variável de ambiente `PORT` em tempo de execução:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variável | Descrição                             | Padrão |
| -------- | ------------------------------------- | ------ |
| `PORT`   | Porta de escuta do Nginx no contêiner | `8080` |

Isso funciona tanto com o Dockerfile padrão quanto com o nonroot.

## ID de Usuário Personalizado (PUID/PGID)

Para ambientes que exigem execução como um usuário específico que não seja root (dispositivos NAS, Kubernetes com contextos de segurança, políticas organizacionais), o BentoPDF oferece um Dockerfile separado com suporte a PUID/PGID no estilo LSIO.

### Compile e Execute

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### Variáveis de Ambiente

| Variável       | Descrição                 | Padrão  |
| -------------- | ------------------------- | ------- |
| `PUID`         | ID do usuário de execução | `1000`  |
| `PGID`         | ID do grupo de execução   | `1000`  |
| `PORT`         | Porta de escuta do Nginx  | `8080`  |
| `DISABLE_IPV6` | Desativar o listener IPv6 | `false` |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### Como Funciona

O contêiner inicia como root, cria um usuário com o PUID/PGID especificado, ajusta a propriedade de todos os diretórios graváveis e depois reduz os privilégios usando `su-exec`. O processo do nginx roda inteiramente como o usuário que você especificou.

> [!NOTE]
> O `Dockerfile` padrão usa `nginx-unprivileged` (UID 101) e é recomendado para a maioria das implantações. Use o `Dockerfile.nonroot` apenas quando precisar de um UID/GID específico.

> [!WARNING]
> PUID/PGID não podem ser `0` (root). O entrypoint valida as entradas e encerra com erro para valores inválidos.

## Com Traefik (Proxy Reverso)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Com Caddy (Proxy Reverso)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Limites de Recursos

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (Integração com Systemd)

O [Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) permite executar contêineres do Podman como serviços do systemd. É ideal para implantações de produção em sistemas Linux.

### Configuração Básica do Quadlet

Crie um arquivo de unidade de contêiner em `~/.config/containers/systemd/bentopdf.container` (usuário) ou `/etc/containers/systemd/bentopdf.container` (sistema):

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Habilite e Inicie

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> Para implantação em todo o sistema, use `systemctl` sem a flag `--user` e coloque o arquivo em `/etc/containers/systemd/`.

### Quadlet com Health Check

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Atualização Automática com Quadlet

O Podman pode atualizar contêineres automaticamente quando houver novas imagens disponíveis:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Configuração de Rede do Quadlet

Para uma configuração de rede personalizada, crie um arquivo de rede `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Depois, referencie-o no seu arquivo de contêiner:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Atualizando

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
