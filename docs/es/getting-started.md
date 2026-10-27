# Primeros pasos

¡Bienvenido a BentoPDF! Esta guía te ayudará a ponerte en marcha rápidamente.

## ¿Qué es BentoPDF?

BentoPDF es un kit de herramientas PDF gratuito, de código abierto y centrado en la privacidad que funciona **por completo en tu navegador**. Tus archivos nunca salen de tu dispositivo: todo el procesamiento ocurre en local mediante tecnología WebAssembly (WASM).

## Inicio rápido

### Opción 1: Usar la versión alojada

Visita [bentopdf.com](https://www.bentopdf.com) para usar BentoPDF al instante, sin instalar nada.

### Opción 2: Autoalojar con Docker

> [!IMPORTANT]
> La conversión de archivos de Office requiere `SharedArrayBuffer`, que necesita las dos cosas siguientes:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - un contexto seguro
>
> `http://localhost` funciona para pruebas locales porque los navegadores consideran fiable la interfaz de loopback. `http://192.168.x.x` u otras IP de red local normalmente no, así que las conversiones de Word/Excel/PowerPoint requerirán HTTPS al acceder desde otros dispositivos de tu red.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF se distribuye en dos versiones: la **versión autoalojada** (`bentopdf-simple`, la usada arriba) para despliegues internos, de equipo u organización, y la **versión comercial** (`bentopdf:latest`) que usa el propio bentopdf.com y los titulares de licencia comercial con despliegues públicos. Ambas incluyen las mismas herramientas PDF: la versión comercial añade el hero, las preguntas frecuentes, los testimonios y el pie de página de bentopdf.com. Si tienes dudas, usa la versión autoalojada.

Después abre `http://localhost:3000` en tu navegador.

> [!NOTE]
> Si estás preparando un despliegue de OCR aislado de la red (air-gapped), además del worker de Tesseract, el runtime principal y los archivos traineddata, debes alojar internamente las fuentes de la capa de texto del OCR. La configuración completa está documentada en [Autoalojamiento](/es/self-hosting/), incluidos `VITE_OCR_FONT_BASE_URL` y el directorio incluido `ocr-fonts/`.

### Opción 3: Compilar desde el código fuente

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Funciones de un vistazo

| Categoría               | Herramientas                                                    |
| ----------------------- | --------------------------------------------------------------- |
| **Convertir a PDF**     | Word, Excel, PowerPoint, imágenes, Markdown, EPUB, MOBI y más   |
| **Convertir desde PDF** | JPG, PNG, texto, Excel, SVG y más                               |
| **Editar y anotar**     | Firmar, resaltar, censurar, rellenar formularios, añadir sellos |
| **Organizar**           | Unir, dividir, rotar, eliminar páginas, reordenar               |
| **Optimizar**           | Comprimir, reparar, aplanar, OCR                                |
| **Seguridad**           | Cifrar, descifrar, quitar restricciones                         |

## Compatibilidad con navegadores

BentoPDF funciona mejor en navegadores modernos:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Siguientes pasos

- [Explorar todas las herramientas](/es/tools/)
- [Autoalojar BentoPDF](/es/self-hosting/)
- [Contribuir al proyecto](/es/contributing)
