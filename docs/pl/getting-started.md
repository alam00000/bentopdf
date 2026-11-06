# Pierwsze kroki

Witaj w Pixel PDF! Ten przewodnik pomoże Ci szybko zacząć.

## Czym jest Pixel PDF?

Pixel PDF to darmowy zestaw narzędzi PDF o otwartym kodzie, stworzony z myślą o prywatności, który działa **w całości w przeglądarce**. Twoje pliki nigdy nie opuszczają urządzenia: całe przetwarzanie odbywa się lokalnie dzięki technologii WebAssembly (WASM).

## Szybki start

### Opcja 1: Użyj wersji hostowanej

Odwiedź [pixelpdf.com](https://www.pixelpdf.com), aby od razu korzystać z Pixel PDF, bez instalacji.

### Opcja 2: Samodzielny hosting z Dockerem

> [!IMPORTANT]
> Konwersja plików Office wymaga `SharedArrayBuffer`, a do tego potrzebne są oba nagłówki:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - bezpieczny kontekst
>
> `http://localhost` działa do testów lokalnych, ponieważ przeglądarki traktują adres pętli zwrotnej jako zaufany. `http://192.168.x.x` i inne adresy LAN zwykle nie są traktowane jako zaufane, więc konwersje Word/Excel/PowerPoint będą wymagały HTTPS przy dostępie z innych urządzeń w sieci.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF jest dostępny w dwóch wersjach: **wersja do samodzielnego hostingu** (`pixelpdf-simple`, użyta powyżej) do wdrożeń wewnętrznych, zespołowych i organizacyjnych oraz **wersja komercyjna** (`pixelpdf:latest`), używana przez samo pixelpdf.com i przez posiadaczy licencji komercyjnej z publicznymi wdrożeniami. Obie zawierają te same narzędzia PDF, a wersja komercyjna dodaje sekcję hero, FAQ, opinie i stopkę z pixelpdf.com. W razie wątpliwości użyj wersji do samodzielnego hostingu.

Następnie otwórz `http://localhost:3000` w przeglądarce.

> [!NOTE]
> Jeśli przygotowujesz wdrożenie OCR w środowisku odciętym od sieci (air-gapped), oprócz workera Tesseract, środowiska uruchomieniowego i plików traineddata musisz hostować wewnętrznie także czcionki warstwy tekstowej OCR. Pełna konfiguracja jest opisana w [Samodzielny hosting](/pl/self-hosting/), wraz z `VITE_OCR_FONT_BASE_URL` i dołączonym katalogiem `ocr-fonts/`.

### Opcja 3: Zbuduj ze źródeł

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funkcje w skrócie

| Kategoria              | Narzędzia                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Konwersja do PDF**   | Word, Excel, PowerPoint, obrazy, Markdown, EPUB, MOBI i więcej                      |
| **Konwersja z PDF**    | JPG, PNG, tekst, Excel, SVG i więcej                                                |
| **Edycja i adnotacje** | Podpisywanie, zakreślanie, redagowanie, wypełnianie formularzy, dodawanie pieczątek |
| **Organizacja**        | Łączenie, dzielenie, obracanie, usuwanie stron, zmiana kolejności                   |
| **Optymalizacja**      | Kompresja, naprawa, spłaszczanie, OCR                                               |
| **Bezpieczeństwo**     | Szyfrowanie, odszyfrowywanie, usuwanie ograniczeń                                   |

## Obsługiwane przeglądarki

Pixel PDF działa najlepiej w nowoczesnych przeglądarkach:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Dalsze kroki

- [Poznaj wszystkie narzędzia](/pl/tools/)
- [Hostuj Pixel PDF samodzielnie](/pl/self-hosting/)
- [Współtwórz projekt](/pl/contributing)
