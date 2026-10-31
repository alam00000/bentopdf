# Začíname

Vitajte v BentoPDF! Táto príručka vám pomôže rýchlo začať.

## Čo je BentoPDF?

BentoPDF je bezplatná open-source sada PDF nástrojov zameraná na súkromie, ktorá beží **celá vo vašom prehliadači**. Vaše súbory nikdy neopustia vaše zariadenie, všetko spracovanie prebieha lokálne pomocou technológie WebAssembly (WASM).

## Rýchly štart

### Možnosť 1: Použite hostovanú verziu

Navštívte [bentopdf.com](https://www.bentopdf.com) a používajte BentoPDF okamžite, bez inštalácie.

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
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF sa dodáva v dvoch zostaveniach: **Self-Hosted build** (`bentopdf-simple`, použitý vyššie) pre interné nasadenia v tímoch a organizáciách a **Commercial build** (`bentopdf:latest`), ktorý používa samotný bentopdf.com a držitelia komerčnej licencie s verejne dostupnými nasadeniami. Obe obsahujú rovnaké PDF nástroje, Commercial build navyše pridáva hero sekciu bentopdf.com, FAQ, referencie a pätičku. Ak si nie ste istí, použite Self-Hosted build.

Potom otvorte `http://localhost:3000` vo svojom prehliadači.

> [!NOTE]
> Ak pripravujete nasadenie OCR v izolovanom prostredí (air-gapped), okrem workera Tesseract, jadra runtime a súborov traineddata musíte interne hostovať aj písma textovej vrstvy OCR. Úplný postup je zdokumentovaný v časti [Vlastný hosting](/sk/self-hosting/), vrátane `VITE_OCR_FONT_BASE_URL` a priloženého adresára `ocr-fonts/`.

### Možnosť 3: Zostavenie zo zdrojového kódu

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

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

BentoPDF funguje najlepšie v moderných prehliadačoch:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Ďalšie kroky

- [Preskúmajte všetky nástroje](/sk/tools/)
- [Vlastný hosting BentoPDF](/sk/self-hosting/)
- [Prispejte do projektu](/sk/contributing)
