# Per iniziare

Benvenuto in BentoPDF! Questa guida ti aiuterà a metterti in funzione rapidamente.

## Cos'è BentoPDF?

BentoPDF è un kit di strumenti PDF gratuito, open source e pensato per la privacy, che funziona **interamente nel tuo browser**. I tuoi file non lasciano mai il dispositivo: tutta l'elaborazione avviene in locale grazie alla tecnologia WebAssembly (WASM).

## Avvio rapido

### Opzione 1: usa la versione ospitata

Visita [bentopdf.com](https://www.bentopdf.com) per usare BentoPDF subito, senza installare nulla.

### Opzione 2: self-hosting con Docker

> [!IMPORTANT]
> La conversione dei file Office richiede `SharedArrayBuffer`, che necessita di entrambi:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - un contesto sicuro
>
> `http://localhost` funziona per i test in locale perché i browser considerano affidabile il loopback. `http://192.168.x.x` o altri IP di rete locale di solito no, quindi le conversioni di Word/Excel/PowerPoint richiederanno HTTPS quando si accede da altri dispositivi della tua rete.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF è disponibile in due build: la **build self-hosted** (`bentopdf-simple`, usata sopra) per installazioni interne, di team o di organizzazioni, e la **build commerciale** (`bentopdf:latest`) usata da bentopdf.com stesso e dai titolari di una licenza commerciale che gestiscono installazioni pubbliche. Entrambe includono gli stessi strumenti PDF: la build commerciale aggiunge hero, FAQ, testimonianze e footer di bentopdf.com. Se hai dubbi, usa la build self-hosted.

Poi apri `http://localhost:3000` nel browser.

> [!NOTE]
> Se stai preparando un'installazione OCR in ambiente air-gapped, devi ospitare internamente anche i font del livello di testo OCR, oltre al worker Tesseract, al runtime core e ai file traineddata. La configurazione completa è descritta in [Self-hosting](/it/self-hosting/), inclusi `VITE_OCR_FONT_BASE_URL` e la cartella inclusa `ocr-fonts/`.

### Opzione 3: compila dai sorgenti

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funzionalità in sintesi

| Categoria             | Strumenti                                                       |
| --------------------- | --------------------------------------------------------------- |
| **Converti in PDF**   | Word, Excel, PowerPoint, immagini, Markdown, EPUB, MOBI e altro |
| **Converti da PDF**   | JPG, PNG, testo, Excel, SVG e altro                             |
| **Modifica e annota** | Firma, evidenzia, oscura, compila moduli, aggiungi timbri       |
| **Organizza**         | Unisci, dividi, ruota, elimina pagine, riordina                 |
| **Ottimizza**         | Comprimi, ripara, appiattisci, OCR                              |
| **Sicurezza**         | Cifra, decifra, rimuovi restrizioni                             |

## Browser supportati

BentoPDF funziona al meglio sui browser moderni:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Prossimi passi

- [Esplora tutti gli strumenti](/it/tools/)
- [Installa BentoPDF sul tuo server](/it/self-hosting/)
- [Contribuisci al progetto](/it/contributing)
