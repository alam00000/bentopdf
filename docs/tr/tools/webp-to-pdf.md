---
title: WebP'den PDF'ye
description: WebP görsellerini ayarlanabilir sıkıştırma kalitesiyle doğrudan tarayıcınızda PDF biçimine dönüştürün.
---

# WebP'den PDF'ye

Google'ın WebP görsel biçimini PDF'ye dönüştürün. Bu, webden WebP biçiminde indirdiğiniz görselleri yazdırma veya paylaşma için daha yaygın kabul gören bir biçime çevirmeniz gerektiğinde özellikle kullanışlıdır.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| WebP  | `.webp`   |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya WebP dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin ve ihtiyacınız olmayan dosyaları kaldırın.
3. Bir **PDF Kalitesi** düzeyi seçin.
4. **PDF'ye Dönüştür** düğmesine tıklayın. Çıktı `from_webps.pdf` olarak indirilir.

Her WebP görseli dahili olarak tarayıcının canvas API'si ile çözülür, ardından pdf-lib kullanılarak PDF'ye gömülür. Bu, dönüştürmenin WebP çözmeyi destekleyen her tarayıcıda çalışması anlamına gelir (tüm modern tarayıcılar destekler).

## Seçenekler

**PDF Kalitesi**, görselleri gömerken sıkıştırmayı belirler:

- **Yüksek Kalite**: en fazla ayrıntıyı korur.
- **Orta Kalite** (varsayılan): dengeli çıktı.
- **Düşük Kalite**: en küçük dosya boyutu.

## Kullanım Alanları

- WebP olarak kaydedilmiş, webden indirilen görselleri yazdırılabilir bir PDF'ye dönüştürmek
- Chrome veya Edge'den alınan WebP ekran görüntülerini belgelere paketlemek
- Varsayılan olarak WebP dışa aktaran tasarım araçlarından gelen görsellerle bir PDF portföyü oluşturmak
- WebP görsellerini daha yaygın okunabilen bir biçimde arşivlemek

## İpuçları

- WebP, PDF'ye gömülmeden önce dahili olarak PNG'ye çözülür, bu nedenle kayıpsız WebP görselleri Yüksek ayarında kalitesini korur.
- WebP ile diğer görsel biçimlerini karıştırdıysanız bunun yerine [Görsellerden PDF'ye](./image-to-pdf) aracını kullanın, hepsini tek seferde kabul eder.

## İlgili Araçlar

- [Görsellerden PDF'ye](./image-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [JPG'den PDF'ye](./jpg-to-pdf)
