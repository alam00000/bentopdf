---
title: PSD'den PDF'ye
description: Photoshop (PSD) dosyalarını tarayıcınızda PDF'e dönüştürün. Ücretsiz, gizli, Adobe yazılımı gerekmez.
---

# PSD'den PDF'ye

Adobe Photoshop PSD dosyalarını PDF belgelerine dönüştürün. PSD, Photoshop'un yerel biçimidir ve bir PSD'yi açmak normalde pahalı Adobe yazılımı gerektirir. Bu araç, PSD dosyanızın düzleştirilmiş bileşik görüntüsünü tam çözünürlüklü bir PDF sayfası olarak işler.

## Desteklenen Biçimler

| Biçim           | Uzantı | Notlar                                 |
| :-------------- | :----- | :------------------------------------- |
| Adobe Photoshop | `.psd` | Düzleştirilmiş bileşik görüntüyü işler |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya PSD dosyalarınızı sürükleyip bırakın. Birden fazla dosya desteklenir.
2. Dosya listesini gözden geçirin. İstenmeyen dosyaları çöp kutusu simgesiyle kaldırın veya daha fazla dosya eklemek için **Daha Fazla Dosya Ekle**'yi kullanın.
3. **PDF'e Dönüştür**'e tıklayın. PyMuPDF motoru PSD dosyasını okur ve bileşik görüntüyü özgün çözünürlükte bir PDF sayfasına gömer.
4. Tek bir PSD bir PDF üretir. Birden fazla PSD dosyası yüklediğinizde bunlar, her PSD bir sayfa olacak şekilde `psd_to_pdf.pdf` adlı tek bir çok sayfalı PDF'te birleştirilir.

## Seçenekler

Ayar gerekmez. Dönüştürücü, PSD dosyasındaki düzleştirilmiş görüntü verisini kullanır.

## Kullanım Alanları

- Photoshop tasarımlarını Photoshop'u açmadan önizlemek
- Adobe Creative Suite'i olmayan müşterilere tasarım provaları göndermek
- PSD dosyalarındaki yüksek çözünürlüklü çalışmaları yazdırmak
- Birden fazla PSD tasarım dosyasından PDF portfolyo oluşturmak: her biri tek belgede bir sayfa olur

## İpuçları

- Dönüştürme, PSD'nin bileşik (düzleştirilmiş) görünümünü işler. Tek tek katmanlar, ayarlama katmanları ve katman efektleri PDF'te ayrı öğeler olarak korunmaz.
- Birden fazla PSD dosyası ayrı PDF'ler yerine tek bir çok sayfalı PDF'te birleştirilir. Bu, portfolyo veya lookbook oluşturmak için kullanışlıdır.
- Çok yüksek çözünürlüklü PSD dosyaları (300+ DPI baskı dosyaları) büyük PDF'ler üretir. Araç tam çözünürlüğü korur.

## İlgili Araçlar

- [Görselden PDF'ye](./image-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [VSD'den PDF'ye](./vsd-to-pdf)
