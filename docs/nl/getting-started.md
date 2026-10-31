# Aan de slag

Welkom bij BentoPDF! Deze gids helpt je snel op weg.

## Wat is BentoPDF?

BentoPDF is een gratis, open-source, privacygerichte PDF-toolkit die **volledig in je browser** draait. Je bestanden verlaten je apparaat nooit: alle verwerking gebeurt lokaal met WebAssembly (WASM).

## Snelstart

### Optie 1: Gebruik de gehoste versie

Ga naar [bentopdf.com](https://www.bentopdf.com) om BentoPDF direct te gebruiken, zonder installatie.

### Optie 2: Zelf hosten met Docker

> [!IMPORTANT]
> Conversie van Office-bestanden vereist `SharedArrayBuffer`, waarvoor beide nodig zijn:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - een beveiligde context
>
> `http://localhost` werkt voor lokaal testen, omdat browsers loopback vertrouwen. `http://192.168.x.x` of andere LAN-IP's doen dat meestal niet, dus voor Word/Excel/PowerPoint-conversies is HTTPS nodig wanneer je ze vanaf andere apparaten in je netwerk opent.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF wordt in twee builds geleverd: de **zelfgehoste build** (`bentopdf-simple`, hierboven gebruikt) voor interne implementaties van teams of organisaties, en de **commerciële build** (`bentopdf:latest`) die bentopdf.com zelf gebruikt en die bedoeld is voor houders van een commerciële licentie met openbare implementaties. Beide bevatten dezelfde PDF-tools. De commerciële build voegt de hero, FAQ, testimonials en footer van bentopdf.com toe. Twijfel je, gebruik dan de zelfgehoste build.

Open daarna `http://localhost:3000` in je browser.

> [!NOTE]
> Als je een air-gapped OCR-implementatie voorbereidt, moet je naast de Tesseract-worker, de core-runtime en de traineddata-bestanden ook de OCR-tekstlaaglettertypen intern hosten. De volledige installatie staat in [Zelf hosten](/nl/self-hosting/), inclusief `VITE_OCR_FONT_BASE_URL` en de meegeleverde map `ocr-fonts/`.

### Optie 3: Bouwen vanuit de broncode

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Functies in het kort

| Categorie                 | Tools                                                                       |
| ------------------------- | --------------------------------------------------------------------------- |
| **Naar PDF converteren**  | Word, Excel, PowerPoint, afbeeldingen, Markdown, EPUB, MOBI en meer         |
| **Van PDF converteren**   | JPG, PNG, tekst, Excel, SVG en meer                                         |
| **Bewerken en annoteren** | Ondertekenen, markeren, redigeren, formulieren invullen, stempels toevoegen |
| **Organiseren**           | Samenvoegen, splitsen, roteren, pagina's verwijderen, herordenen            |
| **Optimaliseren**         | Comprimeren, repareren, platmaken, OCR                                      |
| **Beveiliging**           | Versleutelen, ontsleutelen, beperkingen verwijderen                         |

## Browserondersteuning

BentoPDF werkt het best op moderne browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Volgende stappen

- [Alle tools verkennen](/nl/tools/)
- [BentoPDF zelf hosten](/nl/self-hosting/)
- [Bijdragen aan het project](/nl/contributing)
