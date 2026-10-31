# Contribuir

¡Gracias por tu interés en contribuir a BentoPDF! Esta guía te ayudará a empezar.

## Primeros pasos

### Requisitos previos

- Node.js 18+
- npm 9+
- Git

### Configuración

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Estructura del proyecto

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

## Añadir una herramienta nueva

### Paso 1: Crear el archivo de lógica

Crea `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Paso 2: Crear la página HTML

Crea `src/pages/your-tool.html` siguiendo las plantillas de herramientas existentes.

### Paso 3: Registrar la herramienta

Añade a `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Paso 4: Añadir a la configuración de compilación

Añade la página a `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Paso 5: Añadir traducciones

Añade entradas a todos los archivos de idioma en `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Estilo de código

- Usa TypeScript para todo el código nuevo
- Sigue los patrones existentes para mantener la coherencia
- Ejecuta `npm run format` antes de hacer commit
- Sin comentarios en el código de producción (los comentarios se eliminan durante la compilación)

## Proceso de pull request

1. Crea una rama de funcionalidad: `git checkout -b feature/your-feature`
2. Haz tus cambios
3. Pruébalo a fondo: `npm run build`
4. Envía un PR con una descripción clara

## Traducción

Consulta [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) para añadir nuevos idiomas.

## Acuerdo de licencia de colaborador

Antes de que se pueda fusionar tu PR, tendrás que firmar nuestro CLA:

- [CLA individual (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA corporativo (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Obtener ayuda

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Comunidad de Discord](https://discord.gg/Bgq3Ay3f2w)

## Licencia

BentoPDF tiene doble licencia:

- **AGPL-3.0** para proyectos de código abierto en los que compartes públicamente todo tu código fuente
- **Licencia comercial** para aplicaciones propietarias o de código cerrado: [Obtén la licencia de por vida por $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Al contribuir, aceptas que tus contribuciones se licencien bajo estos términos.
