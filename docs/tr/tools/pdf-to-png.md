---
title: PDF'den PNG'ye
description: PDF sayfalarını ayarlanabilir ölçekte kayıpsız PNG görsellerine dönüştürün. Yüksek kaliteli ekran görüntüleri ve saydam arka planlar için idealdir.
---

# PDF'den PNG'ye

Bir PDF'in her sayfasını PNG görseline dönüştürür. PNG kayıpsız sıkıştırma kullanır, bu nedenle çıktı özgün sayfanın her ayrıntısını korur. Tek sayfalı PDF'ler `.png` dosyası olarak iner; çok sayfalı PDF'ler bir ZIP üretir.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Çıktı çözünürlüğünü denetlemek için **Görüntü Ölçeği** kaydırıcısını ayarlayın.
3. İşlemeyi başlatmak için **Dönüştür** düğmesine tıklayın.
4. Tek bir PNG veya bir ZIP arşivi otomatik olarak iner.

## Seçenekler

- **Görüntü Ölçeği**: 1.0x ile 3.0x arasındadır (varsayılan 2.0x). 2.0x'te standart bir Letter boyutlu sayfa yaklaşık 1.224 x 1.584 piksel olarak işlenir. Yüksek ölçek değerleri, dosya boyutu ve işlem süresi pahasına daha büyük ve daha keskin görseller üretir.

## Çıktı Biçimi

- **Tek sayfa**: `filename.png`
- **Birden fazla sayfa**: `page_1.png`, `page_2.png` vb. içeren `filename_pngs.zip`

## Kullanım Alanları

- Sunumlar için PDF sayfalarının yüksek doğrulukta ekran görüntülerini almak.
- Net kenarlar ve sıkıştırma artefaktı olmaması gereken grafikleri veya diyagramları çıkarmak.
- PDF maketlerinden web tasarımı için varlıklar hazırlamak.
- OCR ön işlemesi için kayıpsız sayfa görselleri oluşturmak.

## İpuçları

- PNG dosyaları JPG'den belirgin biçimde büyüktür. Dosya boyutu mükemmel kaliteden daha önemliyse [PDF'den JPG'ye](./pdf-to-jpg) veya [PDF'den WebP'ye](./pdf-to-webp) kullanın.
- 1.0x ölçekte çıktı, PDF'in özgün çözünürlüğüyle eşleşir. Baskı kalitesinde dışa aktarımlar için 3.0x'e çıkarın.

## İlgili Araçlar

- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF'den WebP'ye](./pdf-to-webp)
- [PDF'den SVG'ye](./pdf-to-svg)
