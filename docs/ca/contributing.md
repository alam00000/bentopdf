# Contribuir

Gràcies pel teu interès a contribuir a BentoPDF! Aquesta guia t'ajudarà a començar.

## Primers passos

### Requisits previs

- Node.js 18+
- npm 9+
- Git

### Configuració

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Estructura del projecte

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

## Afegir una eina nova

### Pas 1: crea el fitxer de lògica

Crea `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Pas 2: crea la pàgina HTML

Crea `src/pages/your-tool.html` seguint les plantilles d'eines existents.

### Pas 3: registra l'eina

Afegeix a `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Pas 4: afegeix-la a la configuració de la compilació

Afegeix la pàgina a `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Pas 5: afegeix les traduccions

Afegeix entrades a tots els fitxers d'idioma de `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Estil de codi

- Utilitza TypeScript per a tot el codi nou
- Segueix els patrons existents per mantenir la coherència
- Executa `npm run format` abans de fer commit
- Sense comentaris al codi de producció (els comentaris s'eliminen durant la compilació)

## Procés de pull request

1. Crea una branca de funcionalitat: `git checkout -b feature/your-feature`
2. Fes els canvis
3. Prova-ho a fons: `npm run build`
4. Envia una PR amb una descripció clara

## Traducció

Consulta [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) per afegir idiomes nous.

## Acord de llicència de col·laborador

Abans que es pugui fusionar la teva PR, hauràs de signar el nostre CLA:

- [CLA individual (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA corporatiu (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Obtenir ajuda

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Comunitat de Discord](https://discord.gg/Bgq3Ay3f2w)

## Llicència

BentoPDF té doble llicència:

- **AGPL-3.0** per a projectes de codi obert on comparteixes tot el codi font públicament
- **Llicència comercial** per a aplicacions propietàries o de codi tancat: [Aconsegueix la llicència vitalícia per 79 $](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

En contribuir, acceptes que les teves contribucions es llicenciïn amb aquests termes.
