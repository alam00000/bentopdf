---
title: PDF'den BMP'ye
description: PDF sayfalarını sıkıştırılmamış BMP görsellerine dönüştürün. Bitmap girdi gerektiren eski sistemler ve baskı iş akışları için kullanışlıdır.
---

# PDF'den BMP'ye

Bir PDF'in her sayfasını BMP (Bitmap) görseline dönüştürür. BMP sıkıştırılmamış bir biçimdir, bu nedenle çıktı kalite kaybı olmadan piksel piksel aynıdır, ancak dosyalar büyüktür.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Dosyayı işlemek için **Dönüştür** düğmesine tıklayın.
3. Tek bir `.bmp` dosyası veya bir ZIP arşivi otomatik olarak iner.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Sayfalar sabit 2x ölçekte işlenir ve PDF'in özgün sayfa boyutlarının yaklaşık iki katı boyutunda görseller üretir.

## Çıktı Biçimi

- **Tek sayfa**: `filename.bmp`
- **Birden fazla sayfa**: `page_1.bmp`, `page_2.bmp` vb. içeren `filename_bmps.zip`

## Kullanım Alanları

- PDF sayfalarını yalnızca BMP girdisi kabul eden eski sistemlere veya donanımlara aktarmak.
- Belirli baskı iş akışları için sıkıştırılmamış görseller hazırlamak.
- Ham piksel verisi gerektiren görüntü işleme araçları için girdi olarak bitmap çıktısı kullanmak.

## İpuçları

- BMP dosyaları sıkıştırma olmadan ham piksel verisi depoladıkları için çok büyüktür. Çoğu kullanım için [PDF'den PNG'ye](./pdf-to-png), çok daha küçük dosyalarla kayıpsız kalite sunar.
- Hedef sisteminiz PNG veya TIFF kabul ediyorsa, disk alanından tasarruf etmek için bu biçimleri tercih edin.

## İlgili Araçlar

- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den TIFF'e](./pdf-to-tiff)
- [PDF'den JPG'ye](./pdf-to-jpg)
