# Mitwirken

Danke für Ihr Interesse, zu BentoPDF beizutragen! Diese Anleitung hilft Ihnen beim Einstieg.

## Erste Schritte

### Voraussetzungen

- Node.js 18+
- npm 9+
- Git

### Einrichtung

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Projektstruktur

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## Ein neues Werkzeug hinzufügen

### Schritt 1: Die Logikdatei erstellen

Erstellen Sie `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Schritt 2: Die HTML-Seite erstellen

Erstellen Sie `src/pages/your-tool.html` nach dem Vorbild der bestehenden Werkzeugvorlagen.

### Schritt 3: Das Werkzeug registrieren

Fügen Sie in `src/js/config/tools.ts` Folgendes hinzu:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Schritt 4: Zur Build-Konfiguration hinzufügen

Fügen Sie die Seite in `vite.config.ts` hinzu:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Schritt 5: Übersetzungen hinzufügen

Fügen Sie Einträge in allen Sprachdateien unter `public/locales/` hinzu:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Code-Stil

- Verwenden Sie TypeScript für allen neuen Code
- Halten Sie sich zugunsten der Einheitlichkeit an bestehende Muster
- Führen Sie vor dem Commit `npm run format` aus
- Keine Kommentare im Produktionscode (Kommentare werden beim Build entfernt)

## Pull-Request-Ablauf

1. Erstellen Sie einen Feature-Branch: `git checkout -b feature/your-feature`
2. Nehmen Sie Ihre Änderungen vor
3. Testen Sie gründlich: `npm run build`
4. Reichen Sie einen PR mit einer klaren Beschreibung ein

## Übersetzung

In [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) erfahren Sie, wie Sie neue Sprachen hinzufügen.

## Contributor License Agreement

Bevor Ihr PR gemergt werden kann, müssen Sie unsere CLA unterzeichnen:

- [Individual CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Corporate CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Hilfe erhalten

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord-Community](https://discord.gg/Bgq3Ay3f2w)

## Lizenz

BentoPDF ist dual lizenziert:

- **AGPL-3.0** für Open-Source-Projekte, bei denen Sie Ihren gesamten Quellcode öffentlich teilen
- **Kommerzielle Lizenz** für proprietäre Anwendungen mit geschlossenem Quellcode: [Lifetime-Lizenz für 79 $ erwerben](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Mit Ihrem Beitrag erklären Sie sich damit einverstanden, dass er unter diesen Bedingungen lizenziert wird.
