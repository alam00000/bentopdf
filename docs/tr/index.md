---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Ücretsiz, Açık Kaynaklı PDF Araçları'
  tagline: PDF'leri tamamen tarayıcınızda işleyin. Yükleme yok. Sunucu yok. Tam gizlilik.
  actions:
    - theme: brand
      text: Başlayın
      link: /tr/getting-started
    - theme: alt
      text: Araçları Görüntüle
      link: /tr/tools/
    - theme: alt
      text: Kendi Sunucunda Barındır
      link: /tr/self-hosting/
    - theme: alt
      text: Ticari Lisans
      link: /tr/licensing

features:
  - icon: 🔒
    title: '%100 Gizli'
    details: Dosyalarınız cihazınızdan asla çıkmaz. Tüm işlemler WebAssembly kullanılarak tarayıcınızda yerel olarak yapılır.
  - icon: ⚡
    title: Hızlı ve Ücretsiz
    details: Kayıt yok, sınır yok, filigran yok. Sınırsız PDF'i sonsuza dek ücretsiz işleyin.
  - icon: 🛠️
    title: 50+ Araç
    details: Dönüştürün, düzenleyin, birleştirin, bölün, sıkıştırın, imzalayın, OCR uygulayın ve daha fazlası. İhtiyacınız olan her şey tek yerde.

  - icon: 🌐
    title: Kendi Sunucunuzda Barındırılabilir
    details: Kendi altyapınıza dağıtın. Docker, Vercel, Netlify, AWS veya kendi OCR worker'ları, dil verileri ve metin katmanı yazı tipleriyle tamamen internetten yalıtılmış ortamlar.
---

## Çevrimdışı OCR

BentoPDF'i internetten yalıtılmış veya çevrimdışı bir ortamda kendi sunucunuzda barındırıyorsanız, OCR için Tesseract worker ve traineddata dosyalarından fazlası gerekir. Aranabilir PDF çıktısı için OCR metin katmanı yazı tiplerinin de kendi ağınızdan sunulması gerekir.
`VITE_OCR_FONT_BASE_URL`, paketle gelen `ocr-fonts/` dizini ve güncellenmiş air-gap iş akışı dahil tam kurulum için [Kendi Sunucunda Barındırma](/tr/self-hosting/) sayfasına bakın.
