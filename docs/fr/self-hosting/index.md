# Guide d'auto-hébergement

BentoPDF peut être auto-hébergé sur votre propre infrastructure. Ce guide présente différentes options de déploiement.

## Démarrage rapide avec Docker / Podman

Le moyen le plus rapide d'auto-héberger BentoPDF :

> [!TIP]
> BentoPDF est disponible en deux versions :
>
> - **Version auto-hébergée** : `ghcr.io/alam00000/bentopdf-simple:latest`. Tous les outils PDF, **sans** l'habillage marketing (pas de section d'accueil, de FAQ, de témoignages ni de pied de page). À utiliser pour les déploiements internes, d'équipe ou d'organisation. Ce **n'est pas** une version « allégée » avec moins de fonctionnalités.
> - **Version commerciale** : `ghcr.io/alam00000/bentopdf:latest`. Le site marketing complet, utilisé par bentopdf.com lui-même et par les titulaires d'une licence commerciale qui exploitent des déploiements publics.
>
> Dans le doute : utilisez la version auto-hébergée.

> [!IMPORTANT]
> La conversion de fichiers Office nécessite `SharedArrayBuffer`, ce qui impose que l'application soit à la fois isolée cross-origin et servie depuis un contexte sécurisé. L'image officielle envoie déjà les en-têtes COOP/COEP requis, mais les navigateurs désactivent quand même `SharedArrayBuffer` sur les origines HTTP simples du réseau local comme `http://192.168.x.x`.
>
> N'utilisez `http://localhost` que pour des tests sur le même appareil. Si les utilisateurs accèdent à BentoPDF via une IP ou un nom d'hôte du réseau local, terminez la connexion en HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Ou avec Docker Compose / Podman Compose :

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

## Podman Quadlet (systemd sous Linux)

Exécutez BentoPDF comme service systemd. Créez `~/.config/containers/systemd/bentopdf.container` :

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

Consultez le [guide de déploiement Docker](/fr/self-hosting/docker) pour la documentation complète de Quadlet.

## Compiler depuis les sources

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Options de configuration

### Version auto-hébergée (mode simple)

La version auto-hébergée (l'image `bentopdf-simple`, aussi appelée mode simple) est **fonctionnellement identique** à la version commerciale : tous les outils PDF sont présents et se comportent de la même façon. Elle masque simplement l'habillage marketing qui n'a de sens que sur bentopdf.com ou sur un déploiement commercial public. **Ce n'est pas une version allégée avec moins de fonctionnalités.**

**Ce que la version auto-hébergée masque** (purement cosmétique, aucune fonctionnalité PDF n'est retirée) :

- Barre de navigation, section d'accueil, section des fonctionnalités, FAQ, témoignages, pied de page
- Remplace le titre de la page par « Outils PDF »

**Ce que la version auto-hébergée conserve** (tout ce qui traite réellement les PDF) :

- Tous les outils PDF (fusion, scission, édition, signature, OCR, conversion Office, etc.)
- La personnalisation de la marque et toute la configuration au build et à l'exécution

La version commerciale (`ghcr.io/alam00000/bentopdf:latest`) est celle qui alimente bentopdf.com et qu'utilisent les titulaires d'une licence commerciale pour des déploiements publics : elle ajoute la section d'accueil, la FAQ, les témoignages et le pied de page qui n'auraient pas de sens sur un outil interne.

Si vous auto-hébergez BentoPDF pour votre équipe, votre organisation ou comme outil interne, utilisez la version auto-hébergée :

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Consultez [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) pour tous les détails.

### Version commerciale (déploiements publics sous votre propre marque)

La version commerciale (l'image `bentopdf`, sans suffixe `-simple`) est celle qui alimente bentopdf.com. Elle inclut le site marketing complet (section d'accueil, fonctionnalités, FAQ, témoignages, pied de page) en plus de tous les outils PDF. Utilisez cette version si vous souhaitez **déployer BentoPDF comme service PDF public sous votre propre marque**, par exemple :

- Vous exploitez BentoPDF comme service SaaS hébergé pour des utilisateurs finaux sur votre propre domaine
- Vous voulez l'expérience de la page d'accueil (sections marketing + outils), et pas seulement la surface brute des outils
- Vous êtes titulaire d'une licence commerciale et intégrez BentoPDF dans un produit commercial

**Exécutez-la telle quelle** (marque BentoPDF, utile pour prévisualiser la version) :

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Compilez-la avec votre propre marque** (le flux commercial typique) :

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Toutes les autres options de build (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, remplacements d'URL WASM, etc.) fonctionnent comme sur la version auto-hébergée.

::: warning Licence
L'exécution de la version commerciale est autorisée selon l'une des deux options de licence de BentoPDF :

- **AGPL-3.0** (gratuite) : autorisée si votre déploiement publie l'intégralité de son code source sous AGPL, y compris les modifications de marque et la logique métier associée.
- **Licence commerciale** (79 $, à vie) : requise pour les déploiements propriétaires ou à code fermé où vous ne publiez pas votre fork de marque ni votre code métier.

Consultez la [page Licence](https://www.bentopdf.com/licensing) pour la comparaison complète. Les modules WASM sous licence AGPL (PyMuPDF, Ghostscript, CoherentPDF) sont chargés depuis un CDN à l'exécution : ils n'entrent donc pas dans votre image et ne changent pas votre situation en matière de licence.
:::

### URL de base

Déployer dans un sous-répertoire :

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Marque personnalisée

Remplacez le logo, le nom et le texte de pied de page par défaut de BentoPDF par les vôtres au moment du build :

| Variable           | Description                                             | Valeur par défaut                       |
| ------------------ | ------------------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nom de marque affiché dans l'en-tête et le pied de page | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Chemin du logo relatif à `public/`                      | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Texte personnalisé du pied de page/copyright            | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Ou via Docker :

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La personnalisation de la marque fonctionne en mode complet comme en mode simple, et peut être combinée avec toutes les autres options de build (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Désactiver des outils précis

Masquez des outils individuels pour des raisons de conformité ou de sécurité. Les outils désactivés sont retirés de la page d'accueil, de la recherche, des raccourcis, du constructeur de workflow et de l'accès direct par URL.

Les identifiants d'outils correspondent à l'URL de la page sans `.html` : ouvrez un outil et regardez l'URL (par ex. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Au build** (intégré au bundle) :

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**À l'exécution** (sans reconstruire : montez un `config.json`) :

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

Les deux méthodes peuvent être combinées : les listes sont fusionnées.

Vous pouvez aussi désactiver des fonctionnalités précises de l'éditeur PDF (par ex. la rédaction) sans désactiver tout l'outil, en ajoutant `editorDisabledCategories` à `config.json`. Consultez le [guide Docker](/fr/self-hosting/docker#desactiver-des-fonctionnalites-de-l-editeur) pour la liste complète des catégories.

## Guides de déploiement

Choisissez votre plateforme :

- [Vercel](/fr/self-hosting/vercel)
- [Netlify](/fr/self-hosting/netlify)
- [Cloudflare Pages](/fr/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/fr/self-hosting/aws)
- [Hostinger](/fr/self-hosting/hostinger)
- [Nginx](/fr/self-hosting/nginx)
- [Apache](/fr/self-hosting/apache)
- [Docker](/fr/self-hosting/docker)
- [Kubernetes](/fr/self-hosting/kubernetes)
- [Proxy CORS](/fr/self-hosting/cors-proxy) : requis pour les signatures numériques

## Problèmes courants

### La conversion Word / ODT / Excel / PowerPoint vers PDF se bloque (SharedArrayBuffer indisponible)

**Symptôme** : les conversions de documents basées sur LibreOffice (Word, ODT, Excel, PowerPoint vers PDF) se bloquent à environ 55 % ou ne démarrent pas. La console du navigateur peut afficher :

> `ReferenceError: SharedArrayBuffer is not defined`

…ou `window.crossOriginIsolated` renvoie `false`, ou la compilation WASM signale `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Cause** : LibreOffice WASM nécessite `SharedArrayBuffer`, que le navigateur n'active que si la page est **isolée cross-origin** ET servie depuis un **contexte sécurisé**. Deux conditions doivent donc être remplies :

1. Chaque réponse inclut les deux en-têtes :
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. La page est servie depuis `https://...` ou `http://localhost`. Le HTTP simple sur une IP du réseau local (par ex. `http://192.168.x.x`) n'est PAS considéré comme sécurisé : les navigateurs y désactivent `SharedArrayBuffer`.

L'écart `00 61 73 6d / 1f 8b 08 08` est un sous-symptôme distinct : il manque l'en-tête de réponse `Content-Encoding: gzip` sur les fichiers précompressés `.wasm.gz` / `.data.gz`, si bien que le navigateur reçoit des octets gzip bruts au lieu du WASM décompressé.

**Solution** : consultez le guide de déploiement de votre plateforme pour la configuration exacte :

- [Nginx →](/fr/self-hosting/nginx#la-conversion-word-odt-excel-vers-pdf-ne-fonctionne-pas)
- [Apache →](/fr/self-hosting/apache#la-conversion-word-odt-excel-vers-pdf-ne-fonctionne-pas)
- [AWS S3 + CloudFront →](/fr/self-hosting/aws#etape-3b-politique-d-en-tetes-de-reponse-requise-pour-libreoffice-wasm)
- [Cloudflare Pages →](/fr/self-hosting/cloudflare#fichier-de-configuration) (`_headers` file)
- [Netlify →](/fr/self-hosting/netlify#la-conversion-word-odt-excel-vers-pdf-reste-bloquee-a-55) (`netlify.toml`)
- [Vercel →](/fr/self-hosting/vercel#la-conversion-word-odt-excel-vers-pdf-ne-fonctionne-pas) (`vercel.json`)
- [Hostinger →](/fr/self-hosting/hostinger#les-outils-libreoffice-ne-fonctionnent-pas) (`.htaccess`)
- [Kubernetes →](/fr/self-hosting/kubernetes#verifier-que-les-en-tetes-sharedarraybuffer-fonctionnent-toujours-ingress-gateway)
- **Docker** : géré automatiquement par la configuration nginx fournie, aucune action nécessaire.

**Vérification** : ouvrez la console des DevTools sur n'importe quelle page BentoPDF et exécutez :

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Si la page est en HTTPS ou en `http://localhost` ET que les deux en-têtes COEP/COOP sont présents sur chaque réponse, les deux vérifications passent. Si vous êtes sur `http://192.168.x.x` ou une autre origine HTTP hors boucle locale, terminez la connexion en HTTPS : aucune correction par simples en-têtes n'existe.

### Fichiers `.mjs` servis en `application/octet-stream`

**Symptôme** : Signer un PDF, le remplissage de formulaire et certains autres outils affichent un lecteur vide ou ne se chargent pas. La console du navigateur signale :

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Cause** : votre serveur web ou reverse proxy n'a pas de correspondance de type MIME pour les fichiers `.mjs` (le lecteur PDF intégré fournit des modules ES avec cette extension). De nombreuses configurations de serveur par défaut utilisent `application/octet-stream` pour les extensions inconnues, ce que les navigateurs refusent d'exécuter comme modules ES.

**Solution** : consultez le guide de déploiement de votre plateforme pour l'extrait exact :

- [Nginx →](/fr/self-hosting/nginx#signer-un-pdf-ou-le-remplissage-de-formulaire-affiche-un-lecteur-vide-erreur-mime-mjs)
- [Apache →](/fr/self-hosting/apache#signer-un-pdf-ou-le-remplissage-de-formulaires-affiche-un-visualiseur-vide-erreur-mime-mjs)
- [AWS S3 + CloudFront →](/fr/self-hosting/aws#etape-2-compiler-et-televerser) (voir `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/fr/self-hosting/kubernetes#erreurs-de-type-mime-mjs-iframe-vide-dans-signer-un-pdf-remplissage-de-formulaire)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger** : géré automatiquement, aucune action nécessaire.

**Vérification** : ouvrez les DevTools, onglet Network, repérez la requête `.mjs` en échec et vérifiez l'en-tête de réponse `Content-Type`. Il doit valoir `application/javascript`. S'il vaut toujours `application/octet-stream`, un reverse proxy ou un CDN en amont détecte peut-être à nouveau le type : vérifiez chaque couche de votre chaîne de diffusion.

## Configuration WASM (composants AGPL)

BentoPDF **n'intègre pas** de bibliothèques de traitement sous licence AGPL dans son code source, mais **préconfigure des URL de CDN** pour que toutes les fonctionnalités marchent immédiatement, sans configuration manuelle.

::: tip Zéro configuration par défaut
Depuis la v2.0.0, les modules WASM sont préconfigurés pour se charger depuis le CDN jsDelivr via des variables d'environnement. Toutes les fonctionnalités avancées fonctionnent immédiatement, sans aucune configuration de l'utilisateur.
:::

| Composant       | Licence  | Fonctionnalités                                                           |
| --------------- | -------- | ------------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Conversion EPUB/MOBI/FB2/XPS, extraction d'images, extraction de tableaux |
| **Ghostscript** | AGPL-3.0 | Conversion PDF/A, compression, redressement, rastérisation                |
| **CoherentPDF** | AGPL-3.0 | Table des matières, pièces jointes, fusion de PDF avec signets            |

### Variables d'environnement par défaut

Elles sont définies dans `.env.production` et intégrées au build :

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

### Remplacer les URL WASM

Vous pouvez remplacer les valeurs par défaut au moment du build pour des déploiements personnalisés :

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

Pour désactiver complètement un module (la configuration manuelle par l'utilisateur via les paramètres avancés devient alors nécessaire), définissez sa variable sur une chaîne vide.

Pour l'OCR, laissez toutes les variables `VITE_TESSERACT_*` vides et conservez les ressources en ligne par défaut, ou définissez ensemble les URL worker/core/lang pour un OCR auto-hébergé ou hors ligne. Si vous n'intégrez que certaines langues d'OCR, définissez aussi `VITE_TESSERACT_AVAILABLE_LANGUAGES` avec les mêmes codes séparés par des virgules afin que l'interface ne propose que les langues installées et que les sélections non prises en charge échouent avec une erreur explicite. Pour une sortie PDF consultable entièrement hors ligne, définissez aussi `VITE_OCR_FONT_BASE_URL` sur le répertoire interne qui sert les polices OCR fournies.

Les utilisateurs peuvent aussi remplacer ces valeurs à tout moment via les **paramètres avancés** de l'interface : les remplacements enregistrés dans le navigateur ont priorité sur les valeurs d'environnement par défaut.

### Déploiement isolé du réseau / hors ligne

Pour les réseaux sans accès à Internet (administrations, santé, finance, etc.). Les URL WASM sont intégrées au JavaScript **au moment du build** : les fichiers WASM eux-mêmes sont téléchargés par le **navigateur de l'utilisateur** à l'exécution. Vous devez donc tout préparer sur une machine connectée à Internet, puis transférer le résultat dans le réseau isolé.

#### Script automatisé (recommandé)

Le script `prepare-airgap.sh` fourni automatise tout le processus : téléchargement des paquets WASM, construction de l'image Docker et production d'un bundle autonome avec un script d'installation.

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

Cela produit un répertoire de bundle :

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Transférez le bundle dans le réseau isolé par clé USB, dépôt d'artefacts interne ou toute méthode approuvée. Exécutez ensuite le script d'installation fourni :

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Le script d'installation charge l'image Docker, extrait les fichiers WASM et démarre éventuellement le conteneur.

**Options du script :**

| Option                         | Description                                                   | Valeur par défaut                    |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------ |
| `--wasm-base-url <url>`        | Emplacement où les WASM seront hébergés en interne            | _(obligatoire, demandée si absente)_ |
| `--image-name <name>`          | Tag de l'image Docker                                         | `bentopdf`                           |
| `--output-dir <path>`          | Répertoire de sortie du bundle                                | `./bentopdf-airgap-bundle`           |
| `--simple-mode`                | Active le mode simple                                         | désactivé                            |
| `--base-url <path>`            | URL de base du sous-répertoire (par ex. `/pdf/`)              | `/`                                  |
| `--language <code>`            | Langue par défaut de l'interface (par ex. `fr`, `de`)         | _(aucune)_                           |
| `--brand-name <name>`          | Nom de marque personnalisé                                    | _(aucun)_                            |
| `--brand-logo <path>`          | Chemin du logo relatif à `public/`                            | _(aucun)_                            |
| `--footer-text <text>`         | Texte de pied de page personnalisé                            | _(aucun)_                            |
| `--ocr-languages <list>`       | Langues d'OCR à intégrer, séparées par des virgules           | `eng`                                |
| `--list-ocr-languages`         | Affiche les codes et noms d'OCR pris en charge, puis quitte   | désactivé                            |
| `--search-ocr-language <term>` | Recherche des codes d'OCR par nom ou abréviation              | désactivé                            |
| `--dockerfile <path>`          | Dockerfile à utiliser                                         | `Dockerfile`                         |
| `--skip-docker`                | Ignore la construction et l'export Docker                     | désactivé                            |
| `--skip-wasm`                  | Ignore le téléchargement WASM (réutilise les fichiers `.tgz`) | désactivé                            |

L'invite interactive accepte aussi `list` pour afficher la liste complète des codes Tesseract pris en charge et `search <term>` pour trouver des correspondances, par exemple `search german` ou `search chi`.

::: warning Exigence de même origine
Les fichiers WASM doivent être servis depuis la **même origine** que l'application BentoPDF. Les Web Workers utilisent `importScripts()`, qui ne peut pas charger de scripts cross-origin. Par exemple, si BentoPDF tourne sur `https://internal.example.com`, l'URL de base WASM doit aussi être `https://internal.example.com/wasm`.
:::

#### Étapes manuelles

<details>
<summary>Si vous préférez procéder manuellement, sans le script</summary>

**Étape 1 : télécharger les paquets WASM et OCR** (sur une machine connectée à Internet)

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

**Étape 2 : construire l'image Docker avec les URL internes**

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

**Étape 3 : exporter l'image Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Étape 4 : transférer dans le réseau isolé**

Copiez par clé USB, dépôt d'artefacts interne ou méthode de transfert approuvée :

- `bentopdf.tar` : l'image Docker
- Les cinq paquets `.tgz` WASM/OCR de l'étape 1
- Le répertoire `tesseract-langdata/` de l'étape 1
- Le répertoire `ocr-fonts/` de l'étape 1

**Étape 5 : installer dans le réseau isolé**

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

Vérifiez que les fichiers sont accessibles aux URL configurées à l'étape 2, notamment `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` et `.../ocr/fonts`.

</details>

::: info Compilation depuis les sources plutôt que Docker ?
Définissez les variables dans `.env.production` avant d'exécuter `npm run build` :

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

### Héberger votre propre proxy WASM

Si vous devez servir des fichiers WASM AGPL avec les en-têtes CORS appropriés, vous pouvez déployer un proxy simple. Consultez le [guide du proxy WASM Cloudflare](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) pour un exemple d'implémentation.

::: tip Pourquoi cette séparation ?
Cette séparation garantit :

- Une conformité juridique claire pour les utilisateurs commerciaux
- Le cœur de BentoPDF reste sous sa double licence (AGPL-3.0 / commerciale)
- Les fichiers WASM sont chargés à l'exécution et non intégrés au code source
  :::

## Configuration requise

| Exigence | Minimum                              |
| -------- | ------------------------------------ |
| Stockage | ~100 Mo (cœur sans les modules AGPL) |
| RAM      | 512 Mo                               |
| CPU      | Tout processeur moderne              |

::: tip
BentoPDF est un site statique : aucune base de données ni serveur backend n'est nécessaire !
:::
