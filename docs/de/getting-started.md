# Erste Schritte

Willkommen bei BentoPDF! Diese Anleitung hilft Ihnen, schnell loszulegen.

## Was ist BentoPDF?

BentoPDF ist ein kostenloses, quelloffenes PDF-Toolkit mit Fokus auf Privatsphäre, das **komplett in Ihrem Browser** läuft. Ihre Dateien verlassen nie Ihr Gerät: Die gesamte Verarbeitung erfolgt lokal mit WebAssembly (WASM).

## Schnellstart

### Option 1: Die gehostete Version nutzen

Besuchen Sie [bentopdf.com](https://www.bentopdf.com), um BentoPDF sofort zu nutzen, ganz ohne Installation.

### Option 2: Selbst hosten mit Docker

> [!IMPORTANT]
> Die Konvertierung von Office-Dateien benötigt `SharedArrayBuffer`. Dafür sind beide folgenden Header sowie ein sicherer Kontext erforderlich:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - ein sicherer Kontext
>
> `http://localhost` funktioniert für lokale Tests, weil Browser Loopback als vertrauenswürdig behandeln. `http://192.168.x.x` oder andere LAN-IPs gelten meist nicht als vertrauenswürdig, daher erfordern Word-/Excel-/PowerPoint-Konvertierungen HTTPS, wenn Sie von anderen Geräten in Ihrem Netzwerk darauf zugreifen.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF gibt es in zwei Builds: dem **Self-Hosted-Build** (`bentopdf-simple`, oben verwendet) für interne Bereitstellungen in Teams und Organisationen und dem **Commercial-Build** (`bentopdf:latest`), den bentopdf.com selbst und Inhaber kommerzieller Lizenzen für öffentlich zugängliche Bereitstellungen nutzen. Beide enthalten dieselben PDF-Werkzeuge. Der Commercial-Build ergänzt den Hero-Bereich, die FAQ, Testimonials und den Footer von bentopdf.com. Im Zweifel nehmen Sie den Self-Hosted-Build.

Öffnen Sie danach `http://localhost:3000` in Ihrem Browser.

> [!NOTE]
> Wenn Sie eine OCR-Bereitstellung in einer Air-Gap-Umgebung vorbereiten, müssen Sie zusätzlich zum Tesseract-Worker, zur Core-Runtime und zu den traineddata-Dateien auch die OCR-Textebenen-Schriften intern hosten. Die vollständige Einrichtung ist unter [Self-Hosting](/de/self-hosting/) dokumentiert, einschließlich `VITE_OCR_FONT_BASE_URL` und des mitgelieferten Verzeichnisses `ocr-fonts/`.

### Option 3: Aus dem Quellcode bauen

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funktionen im Überblick

| Kategorie                   | Werkzeuge                                                                  |
| --------------------------- | -------------------------------------------------------------------------- |
| **In PDF konvertieren**     | Word, Excel, PowerPoint, Bilder, Markdown, EPUB, MOBI und mehr             |
| **Aus PDF konvertieren**    | JPG, PNG, Text, Excel, SVG und mehr                                        |
| **Bearbeiten & Annotieren** | Signieren, Hervorheben, Schwärzen, Formulare ausfüllen, Stempel hinzufügen |
| **Organisieren**            | Zusammenführen, Teilen, Drehen, Seiten löschen, Neu anordnen               |
| **Optimieren**              | Komprimieren, Reparieren, Verflachen, OCR                                  |
| **Sicherheit**              | Verschlüsseln, Entschlüsseln, Beschränkungen entfernen                     |

## Browser-Unterstützung

BentoPDF funktioniert am besten mit modernen Browsern:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Nächste Schritte

- [Alle Werkzeuge entdecken](/de/tools/)
- [BentoPDF selbst hosten](/de/self-hosting/)
- [Zum Projekt beitragen](/de/contributing)
