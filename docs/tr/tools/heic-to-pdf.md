---
title: HEIC'den PDF'ye
description: iPhone ve iPad'lerdeki HEIC ve HEIF görsellerini doğrudan tarayıcınızda PDF biçimine dönüştürün.
---

# HEIC'den PDF'ye

HEIC/HEIF görsellerini PDF'ye dönüştürün. HEIC, iOS 11'den beri iPhone ve iPad'lerde varsayılan fotoğraf biçimidir. Bu araç, masaüstü yazılımı kurmadan veya dosyaları bir sunucuya yüklemeden bu fotoğrafları PDF'ye çevirmenizi sağlar.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| HEIC  | `.heic`   |
| HEIF  | `.heif`   |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya HEIC/HEIF dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin ve istemediğiniz dosyaları kaldırın.
3. **PDF'ye Dönüştür**'e tıklayın. Sonuç `from_heic.pdf` olarak iner.

Her HEIC dosyasının kodu heic2any kitaplığıyla çözülür ve %92 kalitede PNG'ye dönüştürülür. PNG daha sonra pdf-lib ile PDF'ye gömülür; her görsel tam çözünürlükte kendi sayfasında yer alır.

## Seçenekler

Bu araç ek ayar sunmaz. HEIC görselleri gömülmeden önce yüksek kalitede (0,92) PNG'ye dönüştürülür.

## Kullanım Alanları

- Sigorta talebine veya rapora eklemek için iPhone fotoğraflarından PDF oluşturmak
- Bir emlak ilanı için HEIC fotoğraflarını tek bir yazdırılabilir belgeye dönüştürmek
- iPad ekran görüntülerini (HEIF biçimi) paylaşılabilir PDF'ye çevirmek
- Bir seyahat günlüğü için tatil fotoğraflarını toplu dönüştürmek

## İpuçları

- HEIC kod çözme işlemi tamamen tarayıcıda WebAssembly ile yapılır. Kod çözücü yüklenirken ilk dönüşüm biraz sürebilir.
- HEIC'i diğer görsel biçimleriyle (JPG, PNG vb.) karıştırmanız gerekiyorsa, HEIC'i diğer tüm biçimlerle birlikte işleyen [Görselleri PDF'ye](./image-to-pdf) aracını kullanın.
- iPhone'lardaki HEIC dosyaları genellikle GPS koordinatları dahil EXIF verileri içerir. PDF çıktısı bu meta verileri taşımaz.

## İlgili Araçlar

- [Görselleri PDF'ye](./image-to-pdf)
- [JPG'den PDF'ye](./jpg-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
