# Déployer avec Docker / Podman

Le moyen le plus simple d'auto-héberger BentoPDF en production.

> [!IMPORTANT]
> **En-têtes requis pour la conversion de fichiers Office**
>
> Les outils basés sur LibreOffice (conversion Word, Excel, PowerPoint) nécessitent ces en-têtes HTTP pour la prise en charge de `SharedArrayBuffer` :
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> La page doit aussi être servie depuis un contexte sécurisé. `http://localhost` fonctionne pour les tests locaux, mais `http://192.168.x.x` ou d'autres adresses IP du réseau local n'en font généralement pas partie : la conversion Office en HTTP simple échouera donc, même si les en-têtes sont présents.
>
> Les images de conteneur officielles incluent ces en-têtes. Si vous utilisez un reverse proxy (Traefik, Caddy, etc.), assurez-vous que ces en-têtes sont conservés ou ajoutés, et utilisez HTTPS pour tout accès hors bouclage local.

> [!TIP]
> **Utilisateurs de Podman :** toutes les commandes `docker` fonctionnent avec Podman en remplaçant `docker` par `podman` et `docker-compose` par `podman-compose`.

## Démarrage rapide

> [!TIP]
> BentoPDF est proposé en deux versions :
>
> - **Version auto-hébergée** : `ghcr.io/alam00000/bentopdf-simple:latest`. Tous les outils PDF, **sans** l'habillage marketing (ni section d'en-tête, ni FAQ, ni témoignages, ni pied de page). À utiliser pour les déploiements internes, d'équipe ou d'organisation. Ce n'est **pas** une version « allégée » aux fonctionnalités réduites.
> - **Version commerciale** : `ghcr.io/alam00000/bentopdf:latest`. Le site marketing complet, utilisé par bentopdf.com lui-même et par les détenteurs d'une licence commerciale qui exploitent des déploiements publics.
>
> En cas de doute : récupérez la version auto-hébergée.

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

Créez `docker-compose.yml` :

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

Exécutez :

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Construire votre propre image

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

Construisez et exécutez :

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Variables d'environnement

| Variable                             | Description                                                                                                                                                                                                                          | Par défaut                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Compile la variante auto-hébergée (masque l'habillage marketing de bentopdf.com : section d'en-tête, FAQ, témoignages, pied de page). Tous les outils PDF restent disponibles.                                                       | `false`                                                        |
| `BASE_URL`                           | Déployer dans un sous-répertoire                                                                                                                                                                                                     | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL du module WASM PyMuPDF                                                                                                                                                                                                           | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL du module WASM Ghostscript                                                                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL du module WASM CoherentPDF                                                                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL du script worker OCR                                                                                                                                                                                                             | _(vide ; CDN par défaut de Tesseract.js)_                      |
| `VITE_TESSERACT_CORE_URL`            | Dossier du runtime principal OCR                                                                                                                                                                                                     | _(vide ; CDN par défaut de Tesseract.js)_                      |
| `VITE_TESSERACT_LANG_URL`            | Dossier des fichiers traineddata OCR                                                                                                                                                                                                 | _(vide ; CDN par défaut de Tesseract.js)_                      |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Langues OCR séparées par des virgules affichées dans l'interface                                                                                                                                                                     | _(vide ; catalogue complet affiché)_                           |
| `VITE_OCR_FONT_BASE_URL`             | Dossier des polices de la couche de texte OCR                                                                                                                                                                                        | _(vide ; URL de polices Noto distantes)_                       |
| `VITE_DEFAULT_LANGUAGE`              | Langue par défaut de l'interface                                                                                                                                                                                                     | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nom de marque personnalisé                                                                                                                                                                                                           | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Chemin du logo relatif à `public/`                                                                                                                                                                                                   | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Texte de pied de page/copyright personnalisé                                                                                                                                                                                         | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID d'outils séparés par des virgules à masquer                                                                                                                                                                                       | _(vide ; tous les outils activés)_                             |
| `DISABLE_GITHUB_STARS`               | Ignore la récupération du nombre d'étoiles GitHub au chargement de la page et retire `api.github.com` de la CSP. Les builds en Simple Mode l'ignorent toujours.                                                                      | `false`                                                        |
| `SITE_URL`                           | URL publique écrite dans les liens canonical, hreflang et sitemap. Laissez la valeur par défaut, sauf si vous voulez que les moteurs de recherche traitent votre déploiement comme un site à part entière.                           | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Avec un `SITE_URL` personnalisé, chaque page est marquée `noindex` pour que votre copie ne concurrence pas bentopdf.com dans les résultats de recherche. Définissez `true` pour autoriser l'indexation par les moteurs de recherche. | `false`                                                        |

Les URL des modules WASM sont préconfigurées avec des valeurs CDN par défaut : toutes les fonctionnalités avancées fonctionnent sans configuration. Remplacez-les pour les déploiements isolés du réseau ou auto-hébergés.

### Moteurs de recherche

Par défaut, chaque page indique aux moteurs de recherche que bentopdf.com est l'original, afin que votre déploiement n'apparaisse pas comme un doublon. Vous n'avez rien à changer pour une instance privée ou interne.

- **Exclure totalement votre instance des résultats de recherche :** lancez le conteneur avec `-e ROBOTS_NOINDEX=true`. Un simple redémarrage suffit, sans recompilation.
- **Faire de votre instance un site à part entière dans les résultats de recherche :** compilez avec `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Sans `ALLOW_INDEXING=true`, un `SITE_URL` personnalisé marque chaque page `noindex`.

### Content-Security-Policy

L'image nginx est livrée avec un en-tête `Content-Security-Policy` appliqué. Les directives `script-src`, `connect-src` et `font-src` de la CSP sont **générées à la compilation** à partir des variables d'URL `VITE_*` ci-dessus : tous les hôtes que vous passez via `--build-arg` sont automatiquement ajoutés à la politique.

En conséquence :

- Si vous remplacez `VITE_CORS_PROXY_URL` ou `VITE_WASM_*_URL` à la compilation, la CSP autorise automatiquement ces origines, sans configuration supplémentaire.
- Pour les URL sur `cdn.jsdelivr.net`, `script-src` n'autorise que le dossier exact du paquet versionné, par exemple `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, et non tout le CDN. jsDelivr sert n'importe quel paquet npm public ou dépôt GitHub : autoriser tout l'hôte permettrait à chacun de s'exécuter sur votre instance. Les URL sur tout autre hôte sont autorisées par origine.
- Si vous configurez des URL WASM personnalisées _à l'exécution_ via la page Paramètres avancés de l'application, ces origines ne figurent **pas** dans la CSP et le navigateur bloquera les requêtes vers elles. Cela s'applique aussi à une autre version du même paquet sur `cdn.jsdelivr.net`, car seule la version définie à la compilation est autorisée. La configuration à l'exécution est prévue pour l'expérimentation ; pour des URL personnalisées permanentes, définissez l'argument de build `VITE_*` correspondant.
- Dans les déploiements isolés du réseau qui remplacent les trois valeurs `VITE_WASM_*_URL`, ces dossiers de paquets `cdn.jsdelivr.net` sont aussi retirés de la CSP (chaque valeur par défaut est remplacée, pas complétée). Les valeurs par défaut de Tesseract OCR sur `cdn.jsdelivr.net` restent dans la politique tant que vous ne définissez pas aussi les trois valeurs `VITE_TESSERACT_*`. De même, définir `VITE_CORS_PROXY_URL` remplace la valeur publique par défaut `bentopdf-cors-proxy.bentopdf.workers.dev`.

La CSP inclut `'unsafe-eval'` dans `script-src`, car le runtime LibreOffice WASM (utilisé par les outils de conversion Word/Excel/PowerPoint) et la bibliothèque d'images wasm-vips (utilisée par PDF vers TIFF) compilent du code de dispatch interne via `new Function()`. Le supprimer casserait ces outils. Si vous compilez en `SIMPLE_MODE` (sans LibreOffice) et n'avez pas besoin de PDF vers TIFF, vous pouvez modifier manuellement le fichier `security-headers.conf` généré pour retirer `'unsafe-eval'` et obtenir une politique plus stricte.

Pour l'OCR, laissez les variables `VITE_TESSERACT_*` vides afin d'utiliser les ressources en ligne par défaut, ou définissez les trois ensemble pour un OCR auto-hébergé/hors ligne. Les remplacements OCR partiels sont refusés, car le worker, le runtime principal et le dossier traineddata doivent correspondre. Pour une production de PDF avec texte recherchable entièrement hors ligne, définissez aussi `VITE_OCR_FONT_BASE_URL` afin que les polices de la couche de texte OCR soient chargées depuis votre serveur interne plutôt que depuis les URL publiques des polices Noto.

`VITE_DEFAULT_LANGUAGE` définit la langue de l'interface pour les nouveaux visiteurs. Valeurs prises en charge : `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Les utilisateurs peuvent toujours changer de langue : cela ne modifie que la valeur par défaut.

Exemple :

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Image de marque personnalisée

Remplacez le logo, le nom et le texte de pied de page par défaut de BentoPDF par les vôtres. Placez votre fichier de logo dans le dossier `public/` (ou utilisez une image existante), puis passez les variables de marque à la compilation :

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La personnalisation fonctionne en mode complet comme en Simple Mode, et peut se combiner avec toutes les autres options de compilation.

### Désactiver des outils spécifiques

Masquez des outils de l'interface pour des exigences de conformité ou de sécurité. Les outils désactivés sont retirés de la page d'accueil, des résultats de recherche, des raccourcis clavier et du créateur de workflows. L'accès direct par URL affiche une page « outil indisponible ».

Les ID d'outils correspondent à l'URL de la page sans `.html`. Par exemple, si l'outil se trouve à `bentopdf.com/edit-pdf.html`, l'ID est `edit-pdf`.

#### Trouver les ID d'outils

Le plus simple : ouvrez n'importe quel outil dans BentoPDF et regardez l'URL. La dernière partie du chemin (sans `.html`) est l'ID de l'outil.

<details>
<summary>Liste complète des ID d'outils</summary>

**Éditer et annoter :** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Convertir en PDF :** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Convertir depuis PDF :** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organiser et gérer :** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimiser et réparer :** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Sécurité :** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Option 1 : à la compilation (argument de build Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Cela intègre la liste des outils désactivés dans le bundle JavaScript. Une recompilation est nécessaire pour la modifier.

#### Option 2 : à l'exécution (config.json)

Montez un fichier `config.json` dans le répertoire servi, sans recompilation :

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

Ou avec Docker Compose :

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Les deux méthodes peuvent être combinées : les listes sont fusionnées. Si un outil figure dans l'une ou l'autre, il est désactivé.

#### Désactiver des fonctionnalités de l'éditeur

Vous pouvez aussi désactiver des fonctionnalités précises de l'éditeur PDF (p. ex. caviardage, annotations, formulaires) sans désactiver l'outil d'édition entier. Ajoutez `editorDisabledCategories` à votre `config.json` :

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Liste complète des catégories de l'éditeur</summary>

**Zoom :** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotation :** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Formes :** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulaire :** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Caviardage :** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Document :** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Page :** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panneau :** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Outils :** `tools`, `pan`, `pointer`, `capture`

**Sélection :** `selection`, `selection-copy`

**Historique :** `history`, `history-undo`, `history-redo`

</details>

Les catégories sont hiérarchiques : désactiver un parent (p. ex. `annotation`) désactive tous ses enfants.

### Désactiver le compteur d'étoiles GitHub

La barre de navigation affiche le nombre d'étoiles GitHub en direct, récupéré depuis `api.github.com` au chargement de la page. C'est la seule requête externe qui ne sert pas une fonctionnalité PDF. Désactivez-la à la compilation pour retirer le code de récupération du bundle et supprimer `api.github.com` de la Content-Security-Policy :

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Les builds en Simple Mode (`bentopdf-simple`) ignorent toujours le compteur d'étoiles : cette option n'est utile que pour la version commerciale ou les builds complets personnalisés.

### URL WASM personnalisées (isolé du réseau / auto-hébergé)

> [!IMPORTANT]
> Les URL WASM sont intégrées au JavaScript **à la compilation**. Les fichiers WASM sont téléchargés par le **navigateur de l'utilisateur** à l'exécution : Docker ne les télécharge pas pendant le build. Pour les réseaux isolés, vous devez héberger les fichiers WASM sur un serveur interne accessible aux navigateurs.

**Workflow complet pour un réseau isolé :**

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

Utilisez pour `--ocr-languages` les codes affichés par `bash scripts/prepare-airgap.sh --list-ocr-languages`, ou cherchez par nom avec `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Lorsque vous compilez avec un sous-ensemble OCR restreint, passez les mêmes codes à `VITE_TESSERACT_AVAILABLE_LANGUAGES` afin que l'application n'affiche que les langues incluses. Pour une sortie OCR entièrement hors ligne, hébergez aussi le dossier `ocr-fonts/` fourni et pointez `VITE_OCR_FONT_BASE_URL` vers lui.

Définissez une variable sur une chaîne vide pour désactiver ce module (les utilisateurs devront le configurer manuellement via les Paramètres avancés).

## Port personnalisé

Par défaut, BentoPDF écoute sur le port `8080` à l'intérieur du conteneur. Pour le modifier, définissez la variable d'environnement `PORT` à l'exécution :

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Description                           | Par défaut |
| -------- | ------------------------------------- | ---------- |
| `PORT`   | Port d'écoute Nginx dans le conteneur | `8080`     |

Cela fonctionne avec le Dockerfile standard comme avec le Dockerfile nonroot.

## ID utilisateur personnalisé (PUID/PGID)

Pour les environnements qui exigent une exécution sous un utilisateur non root précis (NAS, Kubernetes avec contextes de sécurité, politiques d'organisation), BentoPDF fournit un Dockerfile distinct avec prise en charge PUID/PGID de style LSIO.

### Construire et exécuter

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

### Variables d'environnement

| Variable       | Description                | Par défaut |
| -------------- | -------------------------- | ---------- |
| `PUID`         | ID utilisateur d'exécution | `1000`     |
| `PGID`         | ID de groupe d'exécution   | `1000`     |
| `PORT`         | Port d'écoute Nginx        | `8080`     |
| `DISABLE_IPV6` | Désactiver l'écoute IPv6   | `false`    |

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

### Fonctionnement

Le conteneur démarre en root, crée un utilisateur avec le PUID/PGID indiqué, ajuste la propriété de tous les répertoires inscriptibles, puis abandonne ses privilèges avec `su-exec`. Le processus nginx s'exécute entièrement sous l'utilisateur que vous avez indiqué.

> [!NOTE]
> Le `Dockerfile` standard utilise `nginx-unprivileged` (UID 101) et est recommandé pour la plupart des déploiements. N'utilisez `Dockerfile.nonroot` que si vous avez besoin d'un UID/GID précis.

> [!WARNING]
> PUID/PGID ne peuvent pas valoir `0` (root). Le point d'entrée valide les valeurs et s'arrête avec une erreur si elles sont invalides.

## Avec Traefik (reverse proxy)

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

## Avec Caddy (reverse proxy)

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

Caddyfile :

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Limites de ressources

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

## Podman Quadlet (intégration systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) permet d'exécuter des conteneurs Podman comme services systemd. C'est idéal pour les déploiements en production sur Linux.

### Configuration Quadlet de base

Créez un fichier d'unité de conteneur à `~/.config/containers/systemd/bentopdf.container` (utilisateur) ou `/etc/containers/systemd/bentopdf.container` (système) :

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

### Activer et démarrer

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
> Pour un déploiement à l'échelle du système, utilisez `systemctl` sans l'option `--user` et placez le fichier dans `/etc/containers/systemd/`.

### Quadlet avec contrôle de santé

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

### Mise à jour automatique avec Quadlet

Podman peut mettre à jour automatiquement les conteneurs lorsque de nouvelles images sont disponibles :

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Configuration réseau Quadlet

Pour une configuration réseau personnalisée, créez un fichier réseau `bentopdf.network` :

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Référencez-le ensuite dans votre fichier de conteneur :

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Mise à jour

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
