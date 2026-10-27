# Kom igång

Välkommen till BentoPDF! Den här guiden hjälper dig att komma igång snabbt.

## Vad är BentoPDF?

BentoPDF är ett gratis PDF-verktyg med öppen källkod som sätter integriteten först och körs **helt i din webbläsare**. Dina filer lämnar aldrig din enhet, all bearbetning sker lokalt med hjälp av WebAssembly (WASM).

## Snabbstart

### Alternativ 1: Använd den hostade versionen

Besök [bentopdf.com](https://www.bentopdf.com) för att använda BentoPDF direkt, ingen installation krävs.

### Alternativ 2: Självhosta med Docker

> [!IMPORTANT]
> Konvertering av Office-filer kräver `SharedArrayBuffer`, vilket kräver både:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - en säker kontext
>
> `http://localhost` fungerar för lokal testning eftersom webbläsare betraktar loopback som betrodd. `http://192.168.x.x` och andra LAN-adresser gör det oftast inte, så konvertering av Word/Excel/PowerPoint kräver HTTPS när du kommer åt tjänsten från andra enheter i ditt nätverk.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF levereras i två byggen: **Self-Hosted-bygget** (`bentopdf-simple`, används ovan) för interna driftsättningar i team och organisationer, och **Commercial-bygget** (`bentopdf:latest`) som används av bentopdf.com själv och av innehavare av kommersiell licens som kör publika driftsättningar. Båda innehåller samma PDF-verktyg. Commercial-bygget lägger till hero-sektionen, FAQ, omdömen och sidfoten från bentopdf.com. Är du osäker, använd Self-Hosted-bygget.

Öppna sedan `http://localhost:3000` i din webbläsare.

> [!NOTE]
> Om du förbereder en OCR-driftsättning i en luftgappad miljö måste du även hosta OCR-textlagrets typsnitt internt, utöver Tesseract-workern, kärnkörmiljön och traineddata-filerna. Hela uppsättningen beskrivs i [Självhosting](/sv/self-hosting/), inklusive `VITE_OCR_FONT_BASE_URL` och den medföljande katalogen `ocr-fonts/`.

### Alternativ 3: Bygg från källkod

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funktioner i korthet

| Kategori                    | Verktyg                                                        |
| --------------------------- | -------------------------------------------------------------- |
| **Konvertera till PDF**     | Word, Excel, PowerPoint, bilder, Markdown, EPUB, MOBI och mer  |
| **Konvertera från PDF**     | JPG, PNG, text, Excel, SVG och mer                             |
| **Redigera och kommentera** | Signera, markera, maskera, fyll i formulär, lägg till stämplar |
| **Organisera**              | Slå ihop, dela, rotera, ta bort sidor, ändra ordning           |
| **Optimera**                | Komprimera, reparera, platta ut, OCR                           |
| **Säkerhet**                | Kryptera, dekryptera, ta bort begränsningar                    |

## Webbläsarstöd

BentoPDF fungerar bäst i moderna webbläsare:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Nästa steg

- [Utforska alla verktyg](/sv/tools/)
- [Självhosta BentoPDF](/sv/self-hosting/)
- [Bidra till projektet](/sv/contributing)
