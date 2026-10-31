# Guia d'autoallotjament

BentoPDF es pot autoallotjar a la teva pròpia infraestructura. Aquesta guia cobreix diverses opcions de desplegament.

## Inici ràpid amb Docker / Podman

La manera més ràpida d'autoallotjar BentoPDF:

> [!TIP]
> BentoPDF es distribueix en dues compilacions:
>
> - **Compilació autoallotjada**: `ghcr.io/alam00000/bentopdf-simple:latest`. Totes les eines de PDF, **sense** l'embolcall de màrqueting (sense secció principal, preguntes freqüents, testimonis ni peu de pàgina). Fes-la servir per a desplegaments interns, d'equip o d'organització. **No** és una versió "lite" amb menys funcions.
> - **Compilació comercial**: `ghcr.io/alam00000/bentopdf:latest`. El lloc de màrqueting complet, que fan servir el mateix bentopdf.com i els titulars de llicència comercial que executen desplegaments de cara al públic.
>
> Si tens dubtes: descarrega la compilació autoallotjada.

> [!IMPORTANT]
> La conversió de fitxers d'Office requereix `SharedArrayBuffer`, cosa que vol dir que l'aplicació ha d'estar aïllada entre orígens i servida des d'un context segur. La imatge oficial ja envia les capçaleres COOP/COEP necessàries, però els navegadors encara desactiven `SharedArrayBuffer` en orígens HTTP simples de la xarxa local, com `http://192.168.x.x`.
>
> Utilitza `http://localhost` només per a proves al mateix dispositiu. Si els usuaris accedeixen a BentoPDF mitjançant una IP o un nom d'amfitrió de la xarxa local, finalitza la connexió amb HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

O amb Docker Compose / Podman Compose:

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

Executa BentoPDF com a servei de systemd. Crea `~/.config/containers/systemd/bentopdf.container`:

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

Consulta la [guia de desplegament amb Docker](/ca/self-hosting/docker) per a la documentació completa de Quadlet.

## Compilació des del codi font

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opcions de configuració

### Compilació autoallotjada (mode simple)

La compilació autoallotjada (la imatge `bentopdf-simple`, també anomenada mode simple) és **funcionalment idèntica** a la compilació comercial: totes les eines de PDF hi són i es comporten igual. Només amaga l'embolcall de màrqueting, que només té sentit al mateix bentopdf.com o en un desplegament comercial de cara al públic. **No és una versió reduïda ni "lite".**

**Què amaga la compilació autoallotjada** (només cosmètic, no s'elimina cap funció de PDF):

- Barra de navegació, secció principal, secció de característiques, preguntes freqüents, testimonis i peu de pàgina
- Actualitza el títol de la pàgina a "Eines PDF"

**Què conserva la compilació autoallotjada** (tot el que realment treballa amb PDF):

- Totes les eines de PDF (fusionar, dividir, editar, signar, OCR, conversió d'Office, etc.)
- Compatibilitat amb marca personalitzada i tota la configuració en temps de compilació i d'execució

La compilació comercial (`ghcr.io/alam00000/bentopdf:latest`) és la que fa funcionar el mateix bentopdf.com i la fan servir els titulars de llicència comercial que executen desplegaments de cara al públic: afegeix la secció principal, les preguntes freqüents, els testimonis i el peu de pàgina, que no tindrien sentit en una eina interna.

Si autoallotges BentoPDF per al teu equip, la teva organització o com a eina interna, descarrega la compilació autoallotjada:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Consulta [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) per a més detalls.

### Compilació comercial (desplegaments de cara al públic amb la teva pròpia marca)

La compilació comercial (la imatge `bentopdf`, sense el sufix `-simple`) és la que fa funcionar el mateix bentopdf.com. Inclou el lloc de màrqueting complet (secció principal, característiques, preguntes freqüents, testimonis i peu de pàgina) a més de totes les eines de PDF. Fes servir aquesta compilació quan vulguis **desplegar BentoPDF com a servei de PDF de cara al públic sota la teva pròpia marca**, per exemple:

- Executes BentoPDF com a SaaS allotjat per a usuaris finals al teu propi domini
- Vols l'experiència de pàgina d'aterratge (seccions de màrqueting + eines), no només la superfície nua de les eines
- Ets titular d'una llicència comercial i incrustes BentoPDF en un producte comercial

**Executa'l tal com és** (amb la marca BentoPDF, útil per previsualitzar la compilació):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Compila amb la teva pròpia marca** (el flux de treball comercial habitual):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Totes les altres opcions de compilació (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, substitució d'URL de WASM, etc.) funcionen igual que a la compilació autoallotjada.

::: warning Llicències
Executar la compilació comercial està permès amb qualsevol de les dues opcions de llicència de BentoPDF:

- **AGPL-3.0** (gratuïta): permesa si el teu desplegament publica tot el seu codi font sota AGPL, incloses les modificacions de marca i la lògica de negoci que l'envolta.
- **Llicència comercial** (79 $ de per vida): necessària per a desplegaments de codi tancat o propietaris en què no publiques el codi del teu fork de marca ni del teu codi de negoci.

Consulta la [pàgina de llicències](https://www.bentopdf.com/licensing) per a la comparació completa. Els mòduls WASM amb llicència AGPL (PyMuPDF, Ghostscript, CoherentPDF) es carreguen des d'un CDN en temps d'execució, de manera que no entren a la teva imatge i no canvien la teva situació de llicència.
:::

### URL base

Desplega en un subdirectori:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Marca personalitzada

Substitueix el logotip, el nom i el text del peu de pàgina per defecte de BentoPDF pels teus en temps de compilació:

| Variable           | Descripció                                                | Per defecte                             |
| ------------------ | --------------------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nom de marca mostrat a la capçalera i al peu              | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Ruta del logotip relativa a `public/`                     | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Text personalitzat del peu de pàgina o dels drets d'autor | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

O amb Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La marca funciona tant en mode complet com en mode simple, i es pot combinar amb totes les altres opcions de compilació (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Desactiva eines concretes

Amaga eines individuals per motius de compliment normatiu o de seguretat. Les eines desactivades s'eliminen de la pàgina d'inici, la cerca, les dreceres, el constructor de fluxos de treball i l'accés directe per URL.

Els identificadors d'eina són l'URL de la pàgina sense `.html`: obre qualsevol eina i mira l'URL (per exemple, `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**En temps de compilació** (integrat al paquet):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**En temps d'execució** (sense recompilar: munta un `config.json`):

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

Els dos mètodes es poden combinar: les llistes es fusionen.

També pots desactivar funcions concretes de l'Editor de PDF (per exemple, la censura) sense desactivar tota l'eina, afegint `editorDisabledCategories` a `config.json`. Consulta la [guia de Docker](/ca/self-hosting/docker#desactivar-funcions-de-l-editor) per veure la llista completa de categories.

## Guies de desplegament

Tria la teva plataforma:

- [Vercel](/ca/self-hosting/vercel)
- [Netlify](/ca/self-hosting/netlify)
- [Cloudflare Pages](/ca/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/ca/self-hosting/aws)
- [Hostinger](/ca/self-hosting/hostinger)
- [Nginx](/ca/self-hosting/nginx)
- [Apache](/ca/self-hosting/apache)
- [Docker](/ca/self-hosting/docker)
- [Kubernetes](/ca/self-hosting/kubernetes)
- [Servidor intermediari CORS](/ca/self-hosting/cors-proxy): necessari per a les signatures digitals

## Problemes habituals

### La conversió de Word / ODT / Excel / PowerPoint a PDF es penja (SharedArrayBuffer no disponible)

**Símptoma**: les conversions de documents basades en LibreOffice (Word, ODT, Excel, PowerPoint a PDF) es pengen cap al 55 % o no s'arriben a iniciar. La consola del navegador pot mostrar:

> `ReferenceError: SharedArrayBuffer is not defined`

...o `window.crossOriginIsolated` retorna `false`, o la compilació de WASM informa `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Causa**: LibreOffice WASM requereix `SharedArrayBuffer`, que el navegador només activa quan la pàgina està **aïllada entre orígens** I es serveix des d'un **context segur**. Això vol dir que s'han de complir dues coses:

1. Totes les respostes inclouen les dues capçaleres:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. La pàgina es serveix des de `https://...` o `http://localhost`. HTTP simple en una IP de la xarxa local (p. ex. `http://192.168.x.x`) NO es considera segur: els navegadors hi desactiven `SharedArrayBuffer`.

La discrepància `00 61 73 6d / 1f 8b 08 08` és un subsímptoma a part: als fitxers precomprimits `.wasm.gz` / `.data.gz` els falta la capçalera de resposta `Content-Encoding: gzip`, de manera que el navegador rep bytes gzip en brut en comptes de WASM descomprimit.

**Solució**: consulta la guia de desplegament de la teva plataforma per veure la configuració exacta:

- [Nginx →](/ca/self-hosting/nginx#la-conversio-de-word-odt-excel-a-pdf-no-funciona)
- [Apache →](/ca/self-hosting/apache#la-conversio-de-word-odt-excel-a-pdf-no-funciona)
- [AWS S3 + CloudFront →](/ca/self-hosting/aws#pas-3b-politica-de-capcaleres-de-resposta-obligatoria-per-a-libreoffice-wasm)
- [Cloudflare Pages →](/ca/self-hosting/cloudflare#fitxer-de-configuracio) (`_headers` file)
- [Netlify →](/ca/self-hosting/netlify#la-conversio-de-word-odt-excel-a-pdf-es-queda-al-55) (`netlify.toml`)
- [Vercel →](/ca/self-hosting/vercel#la-conversio-de-word-odt-excel-a-pdf-no-funciona) (`vercel.json`)
- [Hostinger →](/ca/self-hosting/hostinger#les-eines-de-libreoffice-no-funcionen) (`.htaccess`)
- [Kubernetes →](/ca/self-hosting/kubernetes#comprova-que-les-capcaleres-de-sharedarraybuffer-continuen-funcionant-ingress-gateway)
- **Docker**: ho gestiona automàticament la configuració de nginx inclosa, no cal fer res.

**Verificació**: obre la consola de DevTools en qualsevol pàgina de BentoPDF i executa:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si la pàgina és HTTPS o `http://localhost` I les dues capçaleres COEP/COOP són presents a totes les respostes, les dues comprovacions passen. Si ets a `http://192.168.x.x` o a un altre origen HTTP que no sigui de loopback, finalitza la connexió amb HTTPS: no hi ha cap solució només amb capçaleres.

### Fitxers `.mjs` servits com a `application/octet-stream`

**Símptoma**: Signa PDF, l'Emplenador de formularis i algunes altres eines mostren un visualitzador en blanc o no es carreguen. La consola del navegador informa:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Causa**: el teu servidor web o servidor intermediari invers no té cap assignació de tipus MIME per als fitxers `.mjs` (el visualitzador de PDF incorporat inclou mòduls ES amb aquesta extensió). Moltes configuracions de servidor estàndard fan servir `application/octet-stream` per a extensions no reconegudes, i els navegadors es neguen a executar-ho com a mòduls ES.

**Solució**: consulta la guia de desplegament de la teva plataforma per veure el fragment exacte:

- [Nginx →](/ca/self-hosting/nginx#signa-pdf-o-l-emplenador-de-formularis-mostra-un-visualitzador-en-blanc-error-mime-de-mjs)
- [Apache →](/ca/self-hosting/apache#signa-pdf-o-el-emplenador-de-formularis-mostra-un-visor-en-blanc-error-de-mime-amb-mjs)
- [AWS S3 + CloudFront →](/ca/self-hosting/aws#pas-2-compila-i-puja) (consulta `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/ca/self-hosting/kubernetes#errors-de-tipus-mime-de-mjs-iframe-en-blanc-a-signa-pdf-emplenador-de-formularis)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: es gestiona automàticament, no cal fer res.

**Verificació**: obre DevTools → pestanya Network, troba la petició `.mjs` que falla i comprova la capçalera de resposta `Content-Type`. Hauria de ser `application/javascript`. Si encara és `application/octet-stream`, és possible que un servidor intermediari invers o un CDN exterior estigui tornant a detectar el tipus: revisa cada capa de la teva cadena de servei.

## Configuració de WASM (components AGPL)

BentoPDF **no inclou** al seu codi font les biblioteques de processament amb llicència AGPL, però **preconfigura URL de CDN** perquè totes les funcions funcionin de sèrie, sense configuració manual.

::: tip Sense configuració per defecte
Des de la v2.0.0, els mòduls WASM estan preconfigurats per carregar-se des del CDN de jsDelivr mitjançant variables d'entorn. Totes les funcions avançades funcionen de seguida sense cap configuració per part de l'usuari.
:::

| Component       | Llicència | Funcions                                                             |
| --------------- | --------- | -------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0  | Conversió d'EPUB/MOBI/FB2/XPS, extracció d'imatges i de taules       |
| **Ghostscript** | AGPL-3.0  | Conversió a PDF/A, compressió, correcció d'inclinació, rasterització |
| **CoherentPDF** | AGPL-3.0  | Taula de continguts, adjunts, fusió de PDF amb marcadors             |

### Variables d'entorn per defecte

Estan definides a `.env.production` i integrades a la compilació:

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

### Substitució de les URL de WASM

Pots substituir els valors per defecte en temps de compilació per a desplegaments personalitzats:

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

Per desactivar un mòdul del tot (cal que l'usuari el configuri manualment a Configuració avançada), posa la seva variable a una cadena buida.

Per a l'OCR, deixa totes les variables `VITE_TESSERACT_*` buides i conserva els recursos en línia per defecte, o defineix alhora les URL de worker, core i lang per a un OCR autoallotjat o sense connexió. Si només incloses idiomes d'OCR concrets, defineix també `VITE_TESSERACT_AVAILABLE_LANGUAGES` amb els mateixos codis separats per comes perquè la interfície només ofereixi els idiomes instal·lats i les seleccions no admeses fallin amb un error descriptiu. Per obtenir PDF cercables totalment sense connexió, defineix també `VITE_OCR_FONT_BASE_URL` amb el directori intern que serveix els tipus de lletra d'OCR inclosos.

Els usuaris també poden substituir aquests valors per defecte en qualsevol moment a **Configuració avançada** de la interfície: les substitucions de l'usuari desades al navegador tenen prioritat sobre els valors per defecte de l'entorn.

### Desplegament aïllat de la xarxa / sense connexió

Per a xarxes sense accés a Internet (govern, sanitat, finances, etc.). Les URL de WASM s'integren al JavaScript en **temps de compilació**; els fitxers WASM reals els baixa el **navegador de l'usuari** en temps d'execució. Per tant, has de preparar-ho tot en una màquina amb Internet i després transferir-ho a la xarxa aïllada.

#### Script automatitzat (recomanat)

L'script `prepare-airgap.sh` inclòs automatitza tot el procés: descarrega els paquets WASM, compila la imatge de Docker i genera un paquet autocontingut amb un script de configuració.

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

Això genera un directori de paquet:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transfereix el paquet a la xarxa aïllada per USB, un repositori d'artefactes intern o un mètode aprovat. Després executa l'script de configuració inclòs:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

L'script de configuració carrega la imatge de Docker, extreu els fitxers WASM i, opcionalment, inicia el contenidor.

**Opcions de l'script:**

| Indicador                      | Descripció                                                | Per defecte                        |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| `--wasm-base-url <url>`        | On s'allotjaran els WASM internament                      | _(obligatori, es demana si falta)_ |
| `--image-name <name>`          | Etiqueta de la imatge de Docker                           | `bentopdf`                         |
| `--output-dir <path>`          | Directori de sortida del paquet                           | `./bentopdf-airgap-bundle`         |
| `--simple-mode`                | Activa el mode simple                                     | desactivat                         |
| `--base-url <path>`            | URL base del subdirectori (p. ex. `/pdf/`)                | `/`                                |
| `--language <code>`            | Idioma per defecte de la interfície (p. ex. `fr`, `de`)   | _(cap)_                            |
| `--brand-name <name>`          | Nom de marca personalitzat                                | _(cap)_                            |
| `--brand-logo <path>`          | Ruta del logotip relativa a `public/`                     | _(cap)_                            |
| `--footer-text <text>`         | Text personalitzat del peu de pàgina                      | _(cap)_                            |
| `--ocr-languages <list>`       | Idiomes d'OCR a incloure, separats per comes              | `eng`                              |
| `--list-ocr-languages`         | Mostra els codis i noms d'OCR admesos i surt              | desactivat                         |
| `--search-ocr-language <term>` | Cerca codis d'OCR per nom o abreviatura                   | desactivat                         |
| `--dockerfile <path>`          | Dockerfile que s'utilitzarà                               | `Dockerfile`                       |
| `--skip-docker`                | Omet la compilació i l'exportació de Docker               | desactivat                         |
| `--skip-wasm`                  | Omet la baixada de WASM (reutilitza els `.tgz` existents) | desactivat                         |

El mode interactiu també accepta `list` per mostrar la llista completa de codis de Tesseract admesos i `search <term>` per trobar coincidències, com `search german` o `search chi`.

::: warning Requisit del mateix origen
Els fitxers WASM s'han de servir des del **mateix origen** que l'aplicació BentoPDF. Els Web Workers fan servir `importScripts()`, que no pot carregar scripts d'un altre origen. Per exemple, si BentoPDF s'executa a `https://internal.example.com`, l'URL base de WASM també ha de ser `https://internal.example.com/wasm`.
:::

#### Passos manuals

<details>
<summary>Si prefereixes fer-ho manualment sense l'script</summary>

**Pas 1: baixa els paquets WASM i d'OCR** (en una màquina amb Internet)

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

**Pas 2: compila la imatge de Docker amb les URL internes**

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

**Pas 3: exporta la imatge de Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Pas 4: transfereix-ho a la xarxa aïllada**

Copia-ho per USB, un repositori d'artefactes intern o un mètode de transferència aprovat:

- `bentopdf.tar`: la imatge de Docker
- Els cinc paquets `.tgz` de WASM/OCR del pas 1
- El directori `tesseract-langdata/` del pas 1
- El directori `ocr-fonts/` del pas 1

**Pas 5: configura-ho dins de la xarxa aïllada**

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

Assegura't que els fitxers són accessibles a les URL que has configurat al pas 2, incloses `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` i `.../ocr/fonts`.

</details>

::: info Compiles des del codi font en comptes de fer servir Docker?
Defineix les variables a `.env.production` abans d'executar `npm run build`:

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

### Allotja el teu propi servidor intermediari de WASM

Si necessites servir fitxers WASM AGPL amb les capçaleres CORS adequades, pots desplegar un servidor intermediari senzill. Consulta la [guia del servidor intermediari de WASM de Cloudflare](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) per veure una implementació d'exemple.

::: tip Per què separat?
Aquesta separació garanteix:

- Un compliment legal clar per als usuaris comercials
- El nucli de BentoPDF es manté sota la seva llicència dual (AGPL-3.0 / comercial)
- Els fitxers WASM es carreguen en temps d'execució, no s'inclouen al codi font
  :::

## Requisits del sistema

| Requisit       | Mínim                             |
| -------------- | --------------------------------- |
| Emmagatzematge | ~100 MB (nucli sense mòduls AGPL) |
| RAM            | 512 MB                            |
| CPU            | Qualsevol processador modern      |

::: tip
BentoPDF és un lloc estàtic: no cal cap base de dades ni servidor de backend!
:::
