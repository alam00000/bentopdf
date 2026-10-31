---
title: Görselden PDF'ye
description: JPG, PNG, BMP, GIF, TIFF, SVG, HEIC, WebP, PSD ve 10'dan fazla diğer görsel biçimini tek bir PDF dosyasında birleştirin.
---

# Görselden PDF'ye

Evrensel görselden PDF'ye dönüştürücü. Neredeyse her biçimde görsel yükleyin ve bunları tek bir PDF belgesinde birleştirin. Her görsel, özgün ölçülerine uygun boyutta kendi sayfasına yerleşir.

## Desteklenen Biçimler

| Biçim           | Uzantılar                              |
| :-------------- | :------------------------------------- |
| JPEG            | `.jpg`, `.jpeg`                        |
| JPEG 2000       | `.jp2`, `.jpx`                         |
| PNG             | `.png`                                 |
| BMP             | `.bmp`                                 |
| GIF             | `.gif`                                 |
| TIFF            | `.tiff`, `.tif`                        |
| SVG             | `.svg`                                 |
| HEIC/HEIF       | `.heic`, `.heif`                       |
| WebP            | `.webp`                                |
| PSD             | `.psd`                                 |
| Portable Anymap | `.pnm`, `.pgm`, `.pbm`, `.ppm`, `.pam` |
| JPEG XR         | `.jxr`                                 |

Bu, BentoPDF'in tüm görsel dönüştürücüleri arasındaki en geniş biçim desteğidir. Yalnızca belirli bir biçime ihtiyacınız varsa bunun yerine özel araçlardan birini kullanın.

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya görsel dosyalarınızı sürükleyip bırakın. Aynı anda birden fazla dosya seçebilirsiniz.
2. Dosya listesini gözden geçirin. İstemediğiniz dosyaları çöp kutusu simgesiyle kaldırın veya ek görseller eklemek için **Daha Fazla Dosya Ekle**'ye tıklayın.
3. Açılır listeden bir **PDF Kalitesi** düzeyi seçin.
4. **PDF'ye Dönüştür**'e tıklayın. Araç görselleri PyMuPDF motoruyla işler ve sonucu `images_to_pdf.pdf` olarak indirir.

## Seçenekler

**PDF Kalitesi**, görseller PDF'ye gömülürken uygulanan görsel sıkıştırmasını belirler:

- **Yüksek Kalite**: minimum sıkıştırma, daha büyük dosya boyutu. Baskı veya arşiv kullanımı için en iyisi.
- **Orta Kalite** (varsayılan): dengeli sıkıştırma. Çoğu amaç için uygundur.
- **Düşük Kalite**: agresif sıkıştırma, en küçük dosya boyutu. E-posta veya hızlı paylaşım için uygundur.

HEIC ve WebP dosyaları gömülmeden önce otomatik olarak PNG'ye dönüştürülür. Bu işlem şeffaf biçimde gerçekleşir ve ek adım gerektirmez.

## Kullanım Alanları

- Telefon kamerasından alınan taranmış fişleri veya belgeleri tek bir PDF'de birleştirmek
- Karışık biçimli görsellerden fotoğraf portfolyosu veya lookbook oluşturmak
- iPhone fotoğraflarını (HEIC) masaüstü yazılımı kurmadan paylaşılabilir PDF'ye dönüştürmek
- PSD dışa aktarımlarından ve ekran görüntülerinden tasarım maketlerini müşteri teslimatı olarak bir araya getirmek
- Eski görsel biçimlerinden (PNM, JXR, JP2) oluşan bir klasörü tek bir PDF olarak arşivlemek

## İpuçları

- PDF'deki görsel sırası, dosya listesindeki sıraya uyar. Görselleri istediğiniz sırayla yükleyin.
- En küçük dosya boyutu için Düşük Kalite'yi seçin. Metin ağırlıklı taramalarda görsel fark çoğunlukla ihmal edilebilir düzeydedir.
- Yalnızca tek bir görsel biçiminiz varsa özel dönüştürücüler (JPG'den PDF'ye, PNG'den PDF'ye vb.) daha basit bir arayüzle aynı sonucu verir.

## İlgili Araçlar

- [JPG'den PDF'ye](./jpg-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [HEIC'den PDF'ye](./heic-to-pdf)
- [WebP'den PDF'ye](./webp-to-pdf)
