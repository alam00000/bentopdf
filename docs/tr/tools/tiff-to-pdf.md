---
title: TIFF'den PDF'ye
description: Tek ve çok sayfalı TIFF görsellerini tam sayfa desteğiyle tarayıcınızda PDF biçimine dönüştürün.
---

# TIFF'den PDF'ye

TIFF dosyalarını, çok sayfalı TIFF'ler dahil, PDF'e dönüştürün. Bir TIFF dosyasındaki her sayfa (veya "IFD") çıktı PDF'inde ayrı bir sayfa olur. Bu, genellikle çok sayfalı TIFF olarak saklanan taranmış belgeler, fakslar ve tıbbi görüntüler için özellikle kullanışlıdır.

## Desteklenen Biçimler

| Biçim | Uzantılar       |
| :---- | :-------------- |
| TIFF  | `.tiff`, `.tif` |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya TIFF dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin ve gerektiği gibi yönetin.
3. **PDF'e Dönüştür**'e tıklayın. Sonuç `from_tiff.pdf` olarak iner.

Araç her TIFF dosyasını bir JavaScript TIFF çözücüsüyle çözerek her sayfanın ham RGBA piksel verisini çıkarır. Her sayfa bir tuvale işlenir, PNG olarak dışa aktarılır ve PDF'e gömülür. Sayfa boyutları özgün TIFF sayfalarıyla eşleşir.

## Seçenekler

Bu araç ek kalite ayarı sunmaz. Görseller özgün çözünürlüklerinde gömülür.

## Kullanım Alanları

- Çok sayfalı faks belgelerini (TIFF-F) daha taşınabilir bir PDF biçimine dönüştürmek
- TIFF olarak saklanan taranmış belge arşivlerini aranabilir PDF'lere çevirmek (sonrasında OCR aracıyla birleştirin)
- TIFF kullanan tıbbi görüntüleme dosyalarını (patoloji lamları, radyoloji dışa aktarımları) işlemek
- CBS veya uydu görüntüsü TIFF dosyalarını paylaşılabilir belgelere dönüştürmek

## İpuçları

- Çok sayfalı TIFF'ler tam olarak desteklenir. 10 sayfalık bir TIFF, 10 sayfalık bir PDF üretir. TIFF'i önce bölmeniz gerekmez.
- Çok büyük TIFF dosyalarının (yüzlerce megabayt) işlenmesi daha uzun sürebilir, çünkü dosyanın tamamı tarayıcı belleğinde çözülmelidir.
- Elde edilen PDF üzerinde OCR gerekiyorsa, dönüştürmeden sonra [PDF'de OCR](./ocr-pdf) aracından geçirin.

## İlgili Araçlar

- [Görselden PDF'ye](./image-to-pdf)
- [BMP'den PDF'ye](./bmp-to-pdf)
- [JPG'den PDF'ye](./jpg-to-pdf)
