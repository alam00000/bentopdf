# Kom igång

Välkommen till Pixel PDF! Den här guiden hjälper dig att komma igång snabbt.

## Vad är Pixel PDF?

Pixel PDF är ett gratis PDF-verktyg med öppen källkod som sätter integriteten först och körs **helt i din webbläsare**. Dina filer lämnar aldrig din enhet, all bearbetning sker lokalt med hjälp av WebAssembly (WASM).

## Snabbstart

### Alternativ 1: Använd den hostade versionen

Besök [pixelpdf.com](https://www.pixelpdf.com) för att använda Pixel PDF direkt, ingen installation krävs.

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
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF levereras i två byggen: **Self-Hosted-bygget** (`pixelpdf-simple`, används ovan) för interna driftsättningar i team och organisationer, och **Commercial-bygget** (`pixelpdf:latest`) som används av pixelpdf.com själv och av innehavare av kommersiell licens som kör publika driftsättningar. Båda innehåller samma PDF-verktyg. Commercial-bygget lägger till hero-sektionen, FAQ, omdömen och sidfoten från pixelpdf.com. Är du osäker, använd Self-Hosted-bygget.

Öppna sedan `http://localhost:3000` i din webbläsare.

> [!NOTE]
> Om du förbereder en OCR-driftsättning i en luftgappad miljö måste du även hosta OCR-textlagrets typsnitt internt, utöver Tesseract-workern, kärnkörmiljön och traineddata-filerna. Hela uppsättningen beskrivs i [Självhosting](/sv/self-hosting/), inklusive `VITE_OCR_FONT_BASE_URL` och den medföljande katalogen `ocr-fonts/`.

### Alternativ 3: Bygg från källkod

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

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

Pixel PDF fungerar bäst i moderna webbläsare:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Nästa steg

- [Utforska alla verktyg](/sv/tools/)
- [Självhosta Pixel PDF](/sv/self-hosting/)
- [Bidra till projektet](/sv/contributing)
