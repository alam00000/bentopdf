---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Herramientas PDF gratuitas y de código abierto'
  tagline: Procesa PDF por completo en tu navegador. Sin cargas. Sin servidores. Privacidad total.
  actions:
    - theme: brand
      text: Empezar
      link: /es/getting-started
    - theme: alt
      text: Ver herramientas
      link: /es/tools/
    - theme: alt
      text: Autoalojar
      link: /es/self-hosting/
    - theme: alt
      text: Licencia comercial
      link: /es/licensing

features:
  - icon: 🔒
    title: 100% privado
    details: Tus archivos nunca salen de tu dispositivo. Todo el procesamiento ocurre en local en tu navegador mediante WebAssembly.
  - icon: ⚡
    title: Rápido y gratuito
    details: Sin registros, sin límites, sin marcas de agua. Procesa PDF ilimitados gratis, para siempre.
  - icon: 🛠️
    title: Más de 50 herramientas
    details: Convierte, edita, une, divide, comprime, firma, aplica OCR y más. Todo lo que necesitas en un solo lugar.

  - icon: 🌐
    title: Autoalojable
    details: Despliégalo en tu propia infraestructura. Docker, Vercel, Netlify, AWS o entornos totalmente aislados de la red con workers de OCR, datos de idioma y fuentes de capa de texto autoalojados.
---

## OCR sin conexión

Si autoalojas BentoPDF en un entorno aislado de la red o sin conexión, el OCR necesita algo más que el worker de Tesseract y los archivos traineddata. La salida de PDF con texto buscable también necesita que las fuentes de la capa de texto del OCR se sirvan internamente.
Consulta [Autoalojamiento](/es/self-hosting/) para ver la configuración completa, incluidos `VITE_OCR_FONT_BASE_URL`, el directorio incluido `ocr-fonts/` y el flujo de trabajo aislado actualizado.
