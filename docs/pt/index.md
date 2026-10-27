---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Ferramentas PDF Gratuitas e de Código Aberto'
  tagline: Processe PDFs inteiramente no seu navegador. Sem uploads. Sem servidores. Privacidade total.
  actions:
    - theme: brand
      text: Começar
      link: /pt/getting-started
    - theme: alt
      text: Ver Ferramentas
      link: /pt/tools/
    - theme: alt
      text: Hospedar por Conta Própria
      link: /pt/self-hosting/
    - theme: alt
      text: Licença Comercial
      link: /pt/licensing

features:
  - icon: 🔒
    title: 100% Privado
    details: Seus arquivos nunca saem do seu dispositivo. Todo o processamento acontece localmente no seu navegador usando WebAssembly.
  - icon: ⚡
    title: Rápido e Gratuito
    details: Sem cadastros, sem limites, sem marcas d'água. Processe PDFs ilimitados de graça, para sempre.
  - icon: 🛠️
    title: Mais de 50 Ferramentas
    details: Converta, edite, mescle, divida, comprima, assine, aplique OCR e muito mais. Tudo o que você precisa em um só lugar.

  - icon: 🌐
    title: Hospedável por Conta Própria
    details: Implante na sua própria infraestrutura. Docker, Vercel, Netlify, AWS ou ambientes totalmente isolados da internet, com workers de OCR, dados de idioma e fontes da camada de texto hospedados por você.
---

## OCR Offline

Se você hospeda o BentoPDF por conta própria em um ambiente isolado da internet ou offline, o OCR precisa de mais do que o worker do Tesseract e os arquivos traineddata. A saída de PDF pesquisável também exige que as fontes da camada de texto do OCR sejam servidas internamente.
Veja [Self-Hosting](/pt/self-hosting/) para a configuração completa, incluindo `VITE_OCR_FONT_BASE_URL`, o diretório `ocr-fonts/` incluído e o fluxo de trabalho air-gapped atualizado.
