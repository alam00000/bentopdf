# Kom i gang

Velkommen til Pixel PDF! Denne vejledning hjælper dig hurtigt i gang.

## Hvad er Pixel PDF?

Pixel PDF er en gratis, open source PDF-værktøjskasse med privatliv i fokus, der kører **helt i din browser**. Dine filer forlader aldrig din enhed. Al behandling sker lokalt ved hjælp af WebAssembly (WASM).

## Hurtig start

### Mulighed 1: Brug den hostede version

Besøg [pixelpdf.com](https://www.pixelpdf.com) for at bruge Pixel PDF med det samme, uden installation.

### Mulighed 2: Selvhost med Docker

> [!IMPORTANT]
> Konvertering af Office-filer kræver `SharedArrayBuffer`, som kræver både:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - en sikker kontekst
>
> `http://localhost` virker til lokal test, fordi browsere behandler loopback som troværdig. `http://192.168.x.x` eller andre LAN-IP'er gør det normalt ikke, så Word/Excel/PowerPoint-konverteringer kræver HTTPS, når der tilgås fra andre enheder på dit netværk.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF leveres i to builds: **Self-Hosted-builden** (`pixelpdf-simple`, brugt ovenfor) til interne installationer i teams og organisationer, og **Commercial-builden** (`pixelpdf:latest`), som bruges af pixelpdf.com selv og af indehavere af kommercielle licenser med offentligt tilgængelige installationer. Begge indeholder de samme PDF-værktøjer. Commercial-builden tilføjer pixelpdf.com's hero, FAQ, udtalelser og footer. Er du i tvivl, så brug Self-Hosted-builden.

Åbn derefter `http://localhost:3000` i din browser.

> [!NOTE]
> Hvis du forbereder en air-gapped OCR-installation, skal du hoste OCR-tekstlagets skrifttyper internt ud over Tesseract-workeren, kerne-runtime og traineddata-filerne. Den fulde opsætning er beskrevet i [Selvhosting](/da/self-hosting/), herunder `VITE_OCR_FONT_BASE_URL` og den medfølgende mappe `ocr-fonts/`.

### Mulighed 3: Byg fra kildekode

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funktioner i overblik

| Kategori               | Værktøjer                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| **Konverter til PDF**  | Word, Excel, PowerPoint, billeder, Markdown, EPUB, MOBI og mere  |
| **Konverter fra PDF**  | JPG, PNG, tekst, Excel, SVG og mere                              |
| **Rediger og annotér** | Underskriv, fremhæv, sortlæg, udfyld formularer, tilføj stempler |
| **Organiser**          | Flet, opdel, roter, slet sider, omarranger                       |
| **Optimer**            | Komprimer, reparer, fladgør, OCR                                 |
| **Sikkerhed**          | Kryptér, dekryptér, fjern begrænsninger                          |

## Browserunderstøttelse

Pixel PDF fungerer bedst i moderne browsere:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Næste skridt

- [Udforsk alle værktøjer](/da/tools/)
- [Selvhost Pixel PDF](/da/self-hosting/)
- [Bidrag til projektet](/da/contributing)
