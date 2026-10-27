# Premiers pas

Bienvenue sur BentoPDF ! Ce guide vous aidera à démarrer rapidement.

## Qu'est-ce que BentoPDF ?

BentoPDF est une boîte à outils PDF gratuite, open source et axée sur la confidentialité, qui fonctionne **entièrement dans votre navigateur**. Vos fichiers ne quittent jamais votre appareil : tout le traitement se fait en local grâce à la technologie WebAssembly (WASM).

## Démarrage rapide

### Option 1 : utiliser la version hébergée

Rendez-vous sur [bentopdf.com](https://www.bentopdf.com) pour utiliser BentoPDF immédiatement, sans aucune installation.

### Option 2 : auto-hébergement avec Docker

> [!IMPORTANT]
> La conversion de fichiers Office nécessite `SharedArrayBuffer`, qui requiert à la fois :
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - un contexte sécurisé
>
> `http://localhost` fonctionne pour les tests locaux, car les navigateurs considèrent le bouclage local comme fiable. `http://192.168.x.x` ou d'autres adresses IP du réseau local ne le sont généralement pas, donc les conversions Word/Excel/PowerPoint nécessiteront HTTPS lorsqu'on y accède depuis d'autres appareils de votre réseau.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF est proposé en deux versions : la **version auto-hébergée** (`bentopdf-simple`, utilisée ci-dessus) pour les déploiements internes, d'équipe ou d'organisation, et la **version commerciale** (`bentopdf:latest`) utilisée par bentopdf.com lui-même et par les détenteurs d'une licence commerciale qui exploitent des déploiements publics. Les deux proposent les mêmes outils PDF : la version commerciale ajoute la section d'en-tête, la FAQ, les témoignages et le pied de page de bentopdf.com. En cas de doute, utilisez la version auto-hébergée.

Ouvrez ensuite `http://localhost:3000` dans votre navigateur.

> [!NOTE]
> Si vous préparez un déploiement OCR isolé du réseau (air-gapped), vous devez héberger en interne les polices de la couche de texte OCR, en plus du worker Tesseract, du runtime principal et des fichiers traineddata. La configuration complète est documentée dans [Auto-hébergement](/fr/self-hosting/), y compris `VITE_OCR_FONT_BASE_URL` et le dossier `ocr-fonts/` fourni.

### Option 3 : compiler depuis les sources

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Aperçu des fonctionnalités

| Catégorie                | Outils                                                                     |
| ------------------------ | -------------------------------------------------------------------------- |
| **Convertir en PDF**     | Word, Excel, PowerPoint, images, Markdown, EPUB, MOBI et plus encore       |
| **Convertir depuis PDF** | JPG, PNG, texte, Excel, SVG et plus encore                                 |
| **Modifier et annoter**  | Signer, surligner, caviarder, remplir des formulaires, ajouter des tampons |
| **Organiser**            | Fusionner, diviser, pivoter, supprimer des pages, réorganiser              |
| **Optimiser**            | Compresser, réparer, aplatir, OCR                                          |
| **Sécurité**             | Chiffrer, déchiffrer, supprimer les restrictions                           |

## Prise en charge des navigateurs

BentoPDF fonctionne mieux sur les navigateurs modernes :

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Étapes suivantes

- [Explorer tous les outils](/fr/tools/)
- [Auto-héberger BentoPDF](/fr/self-hosting/)
- [Contribuer au projet](/fr/contributing)
