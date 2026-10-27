# Contribuer

Merci de votre intérêt pour la contribution à BentoPDF ! Ce guide vous aidera à démarrer.

## Premiers pas

### Prérequis

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

## Structure du projet

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

## Ajouter un nouvel outil

### Étape 1 : créer le fichier de logique

Créez `src/js/logic/your-tool-page.ts` :

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Étape 2 : créer la page HTML

Créez `src/pages/your-tool.html` en suivant les modèles d'outils existants.

### Étape 3 : enregistrer l'outil

Ajoutez dans `src/js/config/tools.ts` :

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Étape 4 : ajouter à la configuration de build

Ajoutez la page dans `vite.config.ts` :

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Étape 5 : ajouter les traductions

Ajoutez des entrées dans tous les fichiers de langue de `public/locales/` :

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Style de code

- Utilisez TypeScript pour tout nouveau code
- Suivez les conventions existantes pour rester cohérent
- Exécutez `npm run format` avant de commiter
- Pas de commentaires dans le code de production (les commentaires sont supprimés lors du build)

## Processus de pull request

1. Créez une branche de fonctionnalité : `git checkout -b feature/your-feature`
2. Effectuez vos modifications
3. Testez soigneusement : `npm run build`
4. Soumettez une PR avec une description claire

## Traduction

Consultez [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) pour ajouter de nouvelles langues.

## Contrat de licence de contributeur

Avant que votre PR puisse être fusionnée, vous devrez signer notre CLA :

- [CLA individuel (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA d'entreprise (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Obtenir de l'aide

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Communauté Discord](https://discord.gg/Bgq3Ay3f2w)

## Licence

BentoPDF est sous double licence :

- **AGPL-3.0** pour les projets open source où vous partagez publiquement l'intégralité de votre code source
- **Licence commerciale** pour les applications propriétaires ou à code source fermé - [Obtenir la licence à vie pour 79 $](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

En contribuant, vous acceptez que vos contributions soient placées sous ces conditions de licence.
