# Začíname

Vitajte v Pixel PDF! Táto príručka vám pomôže rýchlo začať.

## Čo je Pixel PDF?

Pixel PDF je bezplatná open-source sada PDF nástrojov zameraná na súkromie, ktorá beží **celá vo vašom prehliadači**. Vaše súbory nikdy neopustia vaše zariadenie, všetko spracovanie prebieha lokálne pomocou technológie WebAssembly (WASM).

## Rýchly štart

### Možnosť 1: Použite hostovanú verziu

Navštívte [pixelpdf.com](https://www.pixelpdf.com) a používajte Pixel PDF okamžite, bez inštalácie.

### Možnosť 2: Vlastný hosting pomocou Dockera

> [!IMPORTANT]
> Konverzia súborov Office vyžaduje `SharedArrayBuffer`, ktorý potrebuje obe nasledujúce hlavičky:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - zabezpečený kontext
>
> `http://localhost` funguje pri lokálnom testovaní, pretože prehliadače považujú loopback za dôveryhodný. `http://192.168.x.x` alebo iné adresy LAN zvyčajne nie, preto konverzie Wordu, Excelu a PowerPointu budú pri prístupe z iných zariadení vo vašej sieti vyžadovať HTTPS.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF sa dodáva v dvoch zostaveniach: **Self-Hosted build** (`pixelpdf-simple`, použitý vyššie) pre interné nasadenia v tímoch a organizáciách a **Commercial build** (`pixelpdf:latest`), ktorý používa samotný pixelpdf.com a držitelia komerčnej licencie s verejne dostupnými nasadeniami. Obe obsahujú rovnaké PDF nástroje, Commercial build navyše pridáva hero sekciu pixelpdf.com, FAQ, referencie a pätičku. Ak si nie ste istí, použite Self-Hosted build.

Potom otvorte `http://localhost:3000` vo svojom prehliadači.

> [!NOTE]
> Ak pripravujete nasadenie OCR v izolovanom prostredí (air-gapped), okrem workera Tesseract, jadra runtime a súborov traineddata musíte interne hostovať aj písma textovej vrstvy OCR. Úplný postup je zdokumentovaný v časti [Vlastný hosting](/sk/self-hosting/), vrátane `VITE_OCR_FONT_BASE_URL` a priloženého adresára `ocr-fonts/`.

### Možnosť 3: Zostavenie zo zdrojového kódu

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funkcie v kocke

| Kategória             | Nástroje                                                         |
| --------------------- | ---------------------------------------------------------------- |
| **Konverzia do PDF**  | Word, Excel, PowerPoint, obrázky, Markdown, EPUB, MOBI a ďalšie  |
| **Konverzia z PDF**   | JPG, PNG, text, Excel, SVG a ďalšie                              |
| **Úpravy a poznámky** | Podpis, zvýraznenie, začiernenie, vyplnenie formulárov, pečiatky |
| **Organizácia**       | Zlúčenie, rozdelenie, otočenie, odstránenie strán, zmena poradia |
| **Optimalizácia**     | Kompresia, oprava, zploštenie, OCR                               |
| **Zabezpečenie**      | Šifrovanie, dešifrovanie, odstránenie obmedzení                  |

## Podpora prehliadačov

Pixel PDF funguje najlepšie v moderných prehliadačoch:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Ďalšie kroky

- [Preskúmajte všetky nástroje](/sk/tools/)
- [Vlastný hosting Pixel PDF](/sk/self-hosting/)
- [Prispejte do projektu](/sk/contributing)
