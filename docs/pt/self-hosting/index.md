# Guia de Auto-Hospedagem

O BentoPDF pode ser auto-hospedado na sua própria infraestrutura. Este guia cobre várias opções de implantação.

## Início Rápido com Docker / Podman

A forma mais rápida de auto-hospedar o BentoPDF:

> [!TIP]
> O BentoPDF é distribuído em duas versões:
>
> - **Versão Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Todas as ferramentas de PDF, **sem** os elementos de marketing (sem hero, FAQ, depoimentos nem rodapé). Use esta para implantações internas, de equipe ou de organização. **Não** é uma versão "lite" com menos recursos.
> - **Versão Commercial**: `ghcr.io/alam00000/bentopdf:latest`. O site de marketing completo, usado pelo próprio bentopdf.com e por detentores de licença comercial que executam implantações voltadas ao público.
>
> Na dúvida: use a versão Self-Hosted.

> [!IMPORTANT]
> A conversão de arquivos do Office exige `SharedArrayBuffer`, o que significa que o aplicativo precisa estar isolado de origem cruzada (cross-origin isolated) e ser servido a partir de um contexto seguro. A imagem oficial já envia os cabeçalhos COOP/COEP necessários, mas os navegadores ainda desativam o `SharedArrayBuffer` em origens HTTP simples da rede local, como `http://192.168.x.x`.
>
> Use `http://localhost` apenas para testes no mesmo dispositivo. Se os usuários acessarem o BentoPDF por um IP ou nome de host da rede local, termine a conexão com HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Ou com Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

Execute o BentoPDF como um serviço do systemd. Crie `~/.config/containers/systemd/bentopdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Veja o [guia de implantação com Docker](/pt/self-hosting/docker) para a documentação completa do Quadlet.

## Compilando a Partir do Código-Fonte

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opções de Configuração

### Versão Self-Hosted (Simple Mode)

A versão Self-Hosted (a imagem `bentopdf-simple`, também chamada de Simple Mode) é **funcionalmente idêntica** à versão Commercial: todas as ferramentas de PDF estão presentes e se comportam da mesma forma. Ela apenas oculta os elementos de marketing que só fazem sentido no próprio bentopdf.com ou em uma implantação comercial voltada ao público. **Não é uma versão "lite" nem com menos recursos.**

**O que a versão Self-Hosted oculta** (apenas visual, nenhum recurso de PDF é removido):

- Barra de navegação, seção hero, seção de recursos, FAQ, depoimentos, rodapé
- Altera o título da página para "Ferramentas PDF"

**O que a versão Self-Hosted mantém** (tudo o que de fato trabalha com PDF):

- Todas as ferramentas de PDF (mesclar, dividir, editar, assinar, OCR, conversão do Office etc.)
- Suporte a marca personalizada e toda a configuração em tempo de compilação e de execução

A versão Commercial (`ghcr.io/alam00000/bentopdf:latest`) é a que alimenta o próprio bentopdf.com e é usada por detentores de licença comercial que executam implantações voltadas ao público. Ela acrescenta o hero, o FAQ, os depoimentos e o rodapé, que não fariam sentido em uma ferramenta interna.

Se você está auto-hospedando o BentoPDF para sua equipe, sua organização ou como ferramenta interna, use a versão Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Veja [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) para mais detalhes.

### Versão Commercial (implantações voltadas ao público com sua própria marca)

A versão Commercial (a imagem `bentopdf`, sem o sufixo `-simple`) é a que alimenta o próprio bentopdf.com. Ela inclui o site de marketing completo (hero, recursos, FAQ, depoimentos, rodapé) além de todas as ferramentas de PDF. Use esta versão quando quiser **implantar o BentoPDF como um serviço de PDF voltado ao público, sob sua própria marca**, por exemplo:

- Você executa o BentoPDF como um SaaS hospedado para usuários finais no seu próprio domínio
- Você quer a experiência de landing page (seções de marketing + ferramentas), e não apenas a interface básica das ferramentas
- Você é detentor de licença comercial e incorpora o BentoPDF em um produto comercial

**Execute como está** (com a marca BentoPDF, útil para visualizar a versão):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Compile com a sua própria marca** (o fluxo comercial típico):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Todas as outras opções de tempo de compilação (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, substituições de URL do WASM etc.) funcionam da mesma forma que na versão Self-Hosted.

::: warning Licenciamento
Executar a versão Commercial é permitido sob qualquer uma das duas opções de licença do BentoPDF:

- **AGPL-3.0** (gratuita): permitida se a sua implantação publicar todo o seu código-fonte sob AGPL, incluindo quaisquer modificações de marca e a lógica de negócio associada.
- **Licença comercial** ($79 vitalícia): necessária para implantações proprietárias ou de código fechado, em que você não abre o código do seu fork de marca nem do seu código de negócio.

Veja a [página de Licenciamento](https://www.bentopdf.com/licensing) para a comparação completa. Os módulos WASM licenciados sob AGPL (PyMuPDF, Ghostscript, CoherentPDF) são carregados de uma CDN em tempo de execução, portanto não entram na sua imagem e não alteram a sua situação de licenciamento.
:::

### URL Base

Implante em um subdiretório:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Marca Personalizada

Substitua o logotipo, o nome e o texto de rodapé padrão do BentoPDF pelos seus em tempo de compilação:

| Variável           | Descrição                                       | Padrão                                  |
| ------------------ | ----------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nome da marca exibido no cabeçalho e no rodapé  | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Caminho do logotipo relativo a `public/`        | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Texto personalizado de rodapé/direitos autorais | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Ou via Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

A marca personalizada funciona tanto no modo completo quanto no Simple Mode e pode ser combinada com todas as outras opções de tempo de compilação (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Desativando Ferramentas Específicas

Oculte ferramentas individuais por conformidade ou segurança. As ferramentas desativadas são removidas da página inicial, da busca, dos atalhos, do construtor de fluxos e do acesso direto por URL.

Os IDs das ferramentas são a URL da página sem `.html`: abra qualquer ferramenta e veja a URL (ex.: `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Em tempo de compilação** (incorporado ao pacote):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Em tempo de execução** (sem recompilar, monte um `config.json`):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Os dois métodos podem ser combinados: as listas são mescladas.

Você também pode desativar recursos específicos dentro do Editor de PDF (ex.: redação) sem desativar a ferramenta inteira, adicionando `editorDisabledCategories` ao `config.json`. Veja o [guia do Docker](/pt/self-hosting/docker#desativando-recursos-do-editor) para a lista completa de categorias.

## Guias de Implantação

Escolha sua plataforma:

- [Vercel](/pt/self-hosting/vercel)
- [Netlify](/pt/self-hosting/netlify)
- [Cloudflare Pages](/pt/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/pt/self-hosting/aws)
- [Hostinger](/pt/self-hosting/hostinger)
- [Nginx](/pt/self-hosting/nginx)
- [Apache](/pt/self-hosting/apache)
- [Docker](/pt/self-hosting/docker)
- [Kubernetes](/pt/self-hosting/kubernetes)
- [CORS Proxy](/pt/self-hosting/cors-proxy): necessário para assinaturas digitais

## Problemas Comuns

### Word / ODT / Excel / PowerPoint para PDF Trava (SharedArrayBuffer Indisponível)

**Sintoma**: as conversões de documentos baseadas em LibreOffice (Word, ODT, Excel, PowerPoint para PDF) travam em ~55% ou não iniciam. O console do navegador pode mostrar:

> `ReferenceError: SharedArrayBuffer is not defined`

…ou `window.crossOriginIsolated` retorna `false`, ou a compilação do WASM informa `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Causa**: o LibreOffice WASM exige `SharedArrayBuffer`, que o navegador só habilita quando a página está **isolada de origem cruzada (cross-origin isolated)** E é servida a partir de um **contexto seguro**. Isso significa que duas condições precisam ser verdadeiras:

1. Toda resposta inclui ambos os cabeçalhos:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. A página é servida a partir de `https://...` ou `http://localhost`. HTTP simples em um IP da rede local (ex.: `http://192.168.x.x`) NÃO conta como seguro: os navegadores desativam o `SharedArrayBuffer` nesse caso.

A divergência `00 61 73 6d / 1f 8b 08 08` é um subsintoma separado: os arquivos pré-comprimidos `.wasm.gz` / `.data.gz` estão sem o cabeçalho de resposta `Content-Encoding: gzip`, então o navegador recebe bytes gzip brutos em vez do WASM descompactado.

**Correção**: veja o guia de implantação da sua plataforma para a configuração exata:

- [Nginx →](/pt/self-hosting/nginx#conversao-de-word-odt-excel-para-pdf-nao-funciona)
- [Apache →](/pt/self-hosting/apache#word-odt-excel-para-pdf-nao-funciona)
- [AWS S3 + CloudFront →](/pt/self-hosting/aws#passo-3b-politica-de-cabecalhos-de-resposta-necessaria-para-o-libreoffice-wasm)
- [Cloudflare Pages →](/pt/self-hosting/cloudflare#arquivo-de-configuracao) (arquivo `_headers`)
- [Netlify →](/pt/self-hosting/netlify#conversao-de-word-odt-excel-para-pdf-travada-em-55) (`netlify.toml`)
- [Vercel →](/pt/self-hosting/vercel#conversao-de-word-odt-excel-para-pdf-nao-funciona) (`vercel.json`)
- [Hostinger →](/pt/self-hosting/hostinger#ferramentas-do-libreoffice-nao-funcionam) (`.htaccess`)
- [Kubernetes →](/pt/self-hosting/kubernetes#garantindo-que-os-cabecalhos-do-sharedarraybuffer-continuem-funcionando-ingress-gateway)
- **Docker**: tratado automaticamente pela configuração nginx incluída, sem necessidade de ação.

**Verificação**: abra o Console do DevTools em qualquer página do BentoPDF e execute:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Se a página for HTTPS ou `http://localhost` E ambos os cabeçalhos COEP/COOP estiverem presentes em todas as respostas, as duas verificações passam. Se você estiver em `http://192.168.x.x` ou outra origem HTTP que não seja de loopback, termine a conexão com HTTPS: não existe correção apenas por cabeçalhos.

### Arquivos `.mjs` Servidos como `application/octet-stream`

**Sintoma**: Sign PDF / Form Filler / algumas outras ferramentas mostram um visualizador em branco ou não carregam. O console do navegador informa:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Causa**: seu servidor web ou proxy reverso não tem um mapeamento de tipo MIME para arquivos `.mjs` (o visualizador de PDF incluído traz módulos ES com essa extensão). Muitas configurações padrão de servidor usam `application/octet-stream` para extensões desconhecidas, e os navegadores se recusam a executá-las como módulos ES.

**Correção**: veja o guia de implantação da sua plataforma para o trecho exato:

- [Nginx →](/pt/self-hosting/nginx#sign-pdf-ou-form-filler-mostra-um-visualizador-em-branco-erro-de-mime-de-mjs)
- [Apache →](/pt/self-hosting/apache#assinar-pdf-ou-preencher-formularios-mostra-um-visualizador-em-branco-erro-de-mime-mjs)
- [AWS S3 + CloudFront →](/pt/self-hosting/aws#passo-2-compile-e-envie) (veja `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/pt/self-hosting/kubernetes#erros-de-tipo-mime-de-mjs-iframe-em-branco-no-sign-pdf-form-filler)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: tratados automaticamente, sem necessidade de ação.

**Verificação**: abra o DevTools → aba Network, encontre a requisição `.mjs` com falha e verifique o cabeçalho de resposta `Content-Type`. Ele deve ser `application/javascript`. Se ainda for `application/octet-stream`, um proxy reverso ou CDN externo pode estar reinterpretando o tipo: verifique cada camada da sua cadeia de entrega.

## Configuração do WASM (Componentes AGPL)

O BentoPDF **não inclui** bibliotecas de processamento licenciadas sob AGPL em seu código-fonte, mas **pré-configura URLs de CDN** para que todos os recursos funcionem de imediato, sem configuração manual.

::: tip Zero Configuração por Padrão
A partir da v2.0.0, os módulos WASM vêm pré-configurados para carregar da CDN do jsDelivr por meio de variáveis de ambiente. Todos os recursos avançados funcionam imediatamente, sem nenhuma configuração do usuário.
:::

| Componente      | Licença  | Recursos                                                                 |
| --------------- | -------- | ------------------------------------------------------------------------ |
| **PyMuPDF**     | AGPL-3.0 | Conversão de EPUB/MOBI/FB2/XPS, extração de imagens, extração de tabelas |
| **Ghostscript** | AGPL-3.0 | Conversão para PDF/A, compressão, correção de inclinação, rasterização   |
| **CoherentPDF** | AGPL-3.0 | Índice, anexos, mesclagem de PDF com marcadores                          |

### Variáveis de Ambiente Padrão

Estas são definidas em `.env.production` e incorporadas à compilação:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### Substituindo as URLs do WASM

Você pode substituir os padrões em tempo de compilação para implantações personalizadas:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

Para desativar um módulo por completo (exigindo configuração manual do usuário em Configurações Avançadas), defina sua variável como uma string vazia.

Para OCR, deixe todas as variáveis `VITE_TESSERACT_*` vazias e mantenha os recursos online padrão, ou defina juntas as URLs de worker/core/lang para OCR auto-hospedado/offline. Se você incluir apenas idiomas de OCR específicos, defina também `VITE_TESSERACT_AVAILABLE_LANGUAGES` com os mesmos códigos separados por vírgula, para que a interface ofereça só os idiomas instalados e seleções não compatíveis falhem com um erro descritivo. Para uma saída de PDF pesquisável totalmente offline, defina também `VITE_OCR_FONT_BASE_URL` com o diretório interno que serve as fontes de OCR incluídas.

Os usuários também podem substituir esses padrões a qualquer momento em **Configurações Avançadas** na interface: as substituições do usuário armazenadas no navegador têm prioridade sobre os padrões do ambiente.

### Implantação Air-Gapped / Offline

Para redes sem acesso à internet (governo, saúde, setor financeiro etc.). As URLs do WASM são incorporadas ao JavaScript em **tempo de compilação**, e os arquivos WASM em si são baixados pelo **navegador do usuário** em tempo de execução. Portanto, você precisa preparar tudo em uma máquina com internet e depois transferir para a rede isolada.

#### Script Automatizado (Recomendado)

O script incluído `prepare-airgap.sh` automatiza todo o processo: baixa os pacotes WASM, compila a imagem Docker e produz um pacote autocontido com um script de configuração.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

Isso produz um diretório de pacote:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transfira o pacote para a rede isolada por USB, repositório interno de artefatos ou outro método aprovado. Em seguida, execute o script de configuração incluído:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

O script de configuração carrega a imagem Docker, extrai os arquivos WASM e, opcionalmente, inicia o contêiner.

**Opções do script:**

| Flag                           | Descrição                                                         | Padrão                                 |
| ------------------------------ | ----------------------------------------------------------------- | -------------------------------------- |
| `--wasm-base-url <url>`        | Onde os WASMs serão hospedados internamente                       | _(obrigatório, solicitado se ausente)_ |
| `--image-name <name>`          | Tag da imagem Docker                                              | `bentopdf`                             |
| `--output-dir <path>`          | Diretório de saída do pacote                                      | `./bentopdf-airgap-bundle`             |
| `--simple-mode`                | Ativa o Simple Mode                                               | desativado                             |
| `--base-url <path>`            | URL base do subdiretório (ex.: `/pdf/`)                           | `/`                                    |
| `--language <code>`            | Idioma padrão da interface (ex.: `fr`, `de`)                      | _(nenhum)_                             |
| `--brand-name <name>`          | Nome de marca personalizado                                       | _(nenhum)_                             |
| `--brand-logo <path>`          | Caminho do logotipo relativo a `public/`                          | _(nenhum)_                             |
| `--footer-text <text>`         | Texto de rodapé personalizado                                     | _(nenhum)_                             |
| `--ocr-languages <list>`       | Idiomas de OCR a incluir, separados por vírgula                   | `eng`                                  |
| `--list-ocr-languages`         | Exibe os códigos e nomes de OCR compatíveis e sai                 | desativado                             |
| `--search-ocr-language <term>` | Busca códigos de OCR por nome ou abreviação                       | desativado                             |
| `--dockerfile <path>`          | Dockerfile a usar                                                 | `Dockerfile`                           |
| `--skip-docker`                | Pula a compilação e exportação do Docker                          | desativado                             |
| `--skip-wasm`                  | Pula o download do WASM (reutiliza os arquivos `.tgz` existentes) | desativado                             |

O prompt interativo também aceita `list` para exibir a lista completa de códigos do Tesseract compatíveis e `search <term>` para encontrar correspondências, como `search german` ou `search chi`.

::: warning Requisito de Mesma Origem
Os arquivos WASM devem ser servidos da **mesma origem** do aplicativo BentoPDF. Os Web Workers usam `importScripts()`, que não consegue carregar scripts de outra origem. Por exemplo, se o BentoPDF roda em `https://internal.example.com`, a URL base do WASM também deve ser `https://internal.example.com/wasm`.
:::

#### Passos Manuais

<details>
<summary>Se você prefere fazer manualmente, sem o script</summary>

**Passo 1: Baixe os pacotes WASM e de OCR** (em uma máquina com internet)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**Passo 2: Compile a imagem Docker com as URLs internas**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**Passo 3: Exporte a imagem Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Passo 4: Transfira para a rede isolada**

Copie por USB, repositório interno de artefatos ou outro método de transferência aprovado:

- `bentopdf.tar`: a imagem Docker
- Os cinco pacotes `.tgz` de WASM/OCR do Passo 1
- O diretório `tesseract-langdata/` do Passo 1
- O diretório `ocr-fonts/` do Passo 1

**Passo 5: Configure dentro da rede isolada**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Garanta que os arquivos estejam acessíveis nas URLs que você configurou no Passo 2, incluindo `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` e `.../ocr/fonts`.

</details>

::: info Compilando a partir do código-fonte em vez de usar Docker?
Defina as variáveis em `.env.production` antes de executar `npm run build`:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### Hospedando Seu Próprio Proxy WASM

Se você precisa servir arquivos WASM AGPL com cabeçalhos CORS adequados, pode implantar um proxy simples. Veja o [guia do Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) para um exemplo de implementação.

::: tip Por Que Separar?
Essa separação garante:

- Conformidade legal clara para usuários comerciais
- O núcleo do BentoPDF permanece sob sua licença dupla (AGPL-3.0 / Commercial)
- Os arquivos WASM são carregados em tempo de execução, e não incluídos no código-fonte
  :::

## Requisitos do Sistema

| Requisito     | Mínimo                            |
| ------------- | --------------------------------- |
| Armazenamento | ~100 MB (núcleo sem módulos AGPL) |
| RAM           | 512 MB                            |
| CPU           | Qualquer processador moderno      |

::: tip
O BentoPDF é um site estático: não é necessário banco de dados nem servidor de back-end!
:::
