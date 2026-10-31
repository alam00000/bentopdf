# Contribuire

Grazie per l'interesse a contribuire a BentoPDF! Questa guida ti aiuterà a iniziare.

## Per iniziare

### Prerequisiti

- Node.js 18+
- npm 9+
- Git

### Configurazione

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Struttura del progetto

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

## Aggiungere un nuovo strumento

### Passaggio 1: crea il file della logica

Crea `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Passaggio 2: crea la pagina HTML

Crea `src/pages/your-tool.html` seguendo i modelli degli strumenti esistenti.

### Passaggio 3: registra lo strumento

Aggiungi a `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Passaggio 4: aggiungi alla configurazione di build

Aggiungi la pagina a `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Passaggio 5: aggiungi le traduzioni

Aggiungi le voci a tutti i file delle lingue in `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Stile del codice

- Usa TypeScript per tutto il nuovo codice
- Segui i pattern esistenti per coerenza
- Esegui `npm run format` prima del commit
- Nessun commento nel codice di produzione (i commenti vengono rimossi durante la build)

## Processo delle pull request

1. Crea un branch per la funzionalità: `git checkout -b feature/your-feature`
2. Apporta le tue modifiche
3. Testa con attenzione: `npm run build`
4. Invia una PR con una descrizione chiara

## Traduzione

Consulta [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) per aggiungere nuove lingue.

## Contributor License Agreement

Prima che la tua PR possa essere unita, dovrai firmare la nostra CLA:

- [CLA individuale (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA aziendale (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Ottenere aiuto

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Community Discord](https://discord.gg/Bgq3Ay3f2w)

## Licenza

BentoPDF ha una doppia licenza:

- **AGPL-3.0** per i progetti open source in cui condividi pubblicamente tutto il codice sorgente
- **Licenza commerciale** per le applicazioni proprietarie o closed source: [Ottieni la licenza a vita per $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Contribuendo, accetti che i tuoi contributi siano concessi in licenza secondo questi termini.
