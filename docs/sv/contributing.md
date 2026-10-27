# Bidra

Tack för ditt intresse av att bidra till BentoPDF! Den här guiden hjälper dig att komma igång.

## Komma igång

### Förutsättningar

- Node.js 18+
- npm 9+
- Git

### Installation

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

## Lägga till ett nytt verktyg

### Steg 1: Skapa logikfilen

Skapa `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Steg 2: Skapa HTML-sidan

Skapa `src/pages/your-tool.html` efter mönster från de befintliga verktygsmallarna.

### Steg 3: Registrera verktyget

Lägg till i `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Steg 4: Lägg till i bygginställningarna

Lägg till sidan i `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Steg 5: Lägg till översättningar

Lägg till poster i alla språkfiler i `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Kodstil

- Använd TypeScript för all ny kod
- Följ befintliga mönster för att hålla koden enhetlig
- Kör `npm run format` innan du committar
- Inga kommentarer i produktionskod (kommentarer tas bort vid bygget)

## Pull request-process

1. Skapa en funktionsgren: `git checkout -b feature/your-feature`
2. Gör dina ändringar
3. Testa noggrant: `npm run build`
4. Skicka in en PR med en tydlig beskrivning

## Översättning

Se [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) för hur du lägger till nya språk.

## Licensavtal för bidragsgivare

Innan din PR kan slås ihop måste du signera vårt CLA:

- [Individual CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Corporate CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Få hjälp

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord-community](https://discord.gg/Bgq3Ay3f2w)

## Licens

BentoPDF har dubbel licensiering:

- **AGPL-3.0** för öppen källkod-projekt där du delar hela din källkod offentligt
- **Kommersiell licens** för proprietära program med sluten källkod - [Skaffa livstidslicens för $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Genom att bidra godkänner du att dina bidrag licensieras enligt dessa villkor.
