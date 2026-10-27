---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Darmowe narzędzia PDF o otwartym kodzie'
  tagline: Przetwarzaj pliki PDF w całości w przeglądarce. Bez wysyłania na serwer. Bez serwerów. Pełna prywatność.
  actions:
    - theme: brand
      text: Zacznij
      link: /pl/getting-started
    - theme: alt
      text: Zobacz narzędzia
      link: /pl/tools/
    - theme: alt
      text: Własny hosting
      link: /pl/self-hosting/
    - theme: alt
      text: Licencja komercyjna
      link: /pl/licensing

features:
  - icon: 🔒
    title: W 100% prywatnie
    details: Twoje pliki nigdy nie opuszczają urządzenia. Całe przetwarzanie odbywa się lokalnie w przeglądarce dzięki WebAssembly.
  - icon: ⚡
    title: Szybko i za darmo
    details: Bez rejestracji, bez limitów, bez znaków wodnych. Przetwarzaj dowolną liczbę plików PDF za darmo, na zawsze.
  - icon: 🛠️
    title: Ponad 50 narzędzi
    details: Konwertuj, edytuj, łącz, dziel, kompresuj, podpisuj, rozpoznawaj tekst (OCR) i więcej. Wszystko, czego potrzebujesz, w jednym miejscu.

  - icon: 🌐
    title: Własny hosting
    details: Wdrażaj na własnej infrastrukturze. Docker, Vercel, Netlify, AWS lub w pełni odcięte od sieci środowiska z własnymi workerami OCR, danymi językowymi i czcionkami warstwy tekstowej.
---

## OCR offline

Jeśli hostujesz BentoPDF samodzielnie w środowisku odciętym od sieci lub offline, OCR potrzebuje czegoś więcej niż worker Tesseract i pliki traineddata. Aby uzyskać przeszukiwalny plik PDF, czcionki warstwy tekstowej OCR muszą być serwowane wewnętrznie.
Pełna konfiguracja, w tym `VITE_OCR_FONT_BASE_URL`, dołączony katalog `ocr-fonts/` i zaktualizowany proces dla środowisk air-gapped, jest w [Samodzielny hosting](/pl/self-hosting/).
