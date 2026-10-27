---
title: PDF'den SVG'ye
description: PDF sayfalarını ölçeklenebilir SVG vektör grafiklerine dönüştürün. Metni ve şekilleri vektör yolları olarak koruyarak sonsuz ölçeklemeye olanak tanır.
---

# PDF'den SVG'ye

Bir PDF'in her sayfasını SVG (Scalable Vector Graphics) dosyasına dönüştürür. Raster biçimlerden farklı olarak SVG, vektör yollarını, metni ve şekilleri korur; böylece çıktı pikselleşme olmadan her boyuta ölçeklenir. PyMuPDF ile çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin. Birden fazla dosya ekleyebilir ve bunları tek tek yönetebilirsiniz.
2. Yüklenen tüm dosyaları işlemek için **SVG'ye Dönüştür** düğmesine tıklayın.
3. Tek dosyalı, tek sayfalı dönüştürmeler bağımsız bir `.svg` olarak iner. Diğer her şey ZIP arşivi olarak iner.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Her sayfa, PyMuPDF'in yerel vektör dışa aktarımıyla SVG'ye dönüştürülür.

## Çıktı Biçimi

- **Tek dosya, tek sayfa**: `filename.svg`
- **Tek dosya, birden fazla sayfa**: `page_1.svg`, `page_2.svg` vb. içeren `filename_svg.zip`
- **Birden fazla dosya**: dosyaların kaynak belge adına göre düzenlendiği `pdf_to_svg.zip`.

## Kullanım Alanları

- PDF raporlarındaki vektör diyagramlarını, grafikleri veya çizimleri web sayfalarında kullanmak üzere çıkarmak.
- PDF sayfa içeriğini Inkscape veya Illustrator gibi bir vektör düzenleyicide düzenlemek.
- Duyarlı web uygulamalarına ölçeklenebilir sayfa önizlemeleri gömmek.
- PDF broşürlerden logoları veya grafikleri keskin kenarlarını koruyarak çıkarmak.

## İpuçları

- SVG, vektör içerik barındıran PDF'lerle en iyi sonucu verir. Taranmış belgeler veya görsel ağırlıklı PDF'ler, gömülü raster veri içeren büyük SVG dosyaları üretir.
- Görsel ağırlıklı PDF'lerin raster çıktısı için bunun yerine [PDF'den PNG'ye](./pdf-to-png) veya [PDF'den JPG'ye](./pdf-to-jpg) kullanın.
- Bu araç toplu dönüştürmeyi destekler: birden fazla PDF'i aynı anda yükleyerek tek seferde dönüştürebilirsiniz.

## İlgili Araçlar

- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF'den Markdown'a](./pdf-to-markdown)
