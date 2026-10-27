# Contributing

Tak for din interesse i at bidrage til BentoPDF! Denne vejledning hjælper dig i gang.

## Kom i gang

### Forudsætninger

- Node.js 18+
- npm 9+
- Git

### Opsætning

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

## Tilføj et nyt værktøj

### Trin 1: Opret logikfilen

Opret `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Trin 2: Opret HTML-siden

Opret `src/pages/your-tool.html` efter de eksisterende værktøjsskabeloner.

### Trin 3: Registrer værktøjet

Tilføj til `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Trin 4: Tilføj til build-konfigurationen

Tilføj siden til `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Trin 5: Tilføj oversættelser

Tilføj poster til alle sprogfiler i `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Kodestil

- Brug TypeScript til al ny kode
- Følg eksisterende mønstre for at holde det ensartet
- Kør `npm run format` før du committer
- Ingen kommentarer i produktionskode (kommentarer fjernes under build)

## Pull request-processen

1. Opret en feature-branch: `git checkout -b feature/your-feature`
2. Foretag dine ændringer
3. Test grundigt: `npm run build`
4. Send en PR med en tydelig beskrivelse

## Oversættelse

Se [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) for at tilføje nye sprog.

## Contributor License Agreement

Før din PR kan flettes, skal du underskrive vores CLA:

- [Individuel CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Virksomheds-CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Få hjælp

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord-fællesskab](https://discord.gg/Bgq3Ay3f2w)

## Licens

BentoPDF er dobbeltlicenseret:

- **AGPL-3.0** til open source-projekter, hvor du deler hele din kildekode offentligt
- **Kommerciel licens** til proprietære applikationer med lukket kildekode: [Få en livstidslicens for $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Når du bidrager, accepterer du, at dine bidrag licenseres på disse vilkår.
