---
title: PDF'den TIFF'e
description: PDF sayfalarını baskı, faks ve arşiv iş akışlarında yaygın olarak kullanılan TIFF görsellerine dönüştürün. Kodlama başarısız olursa PNG'ye geçer.
---

# PDF'den TIFF'e

Bir PDF'in her sayfasını TIFF görseline dönüştürür. TIFF; baskı üretimi, faks sistemleri ve belge arşivleme için standart biçimdir. Araç, TIFF kodlaması için PackBits sıkıştırması kullanır ve bir sayfa kodlanamazsa PNG'ye geçer.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Dosyayı işlemek için **Dönüştür** düğmesine tıklayın.
3. Tek bir TIFF dosyası veya bir ZIP arşivi otomatik olarak iner.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Sayfalar sabit 2x ölçekte işlenir.

## Çıktı Biçimi

- **Tek sayfa**: `filename.tiff`
- **Birden fazla sayfa**: `page_1.tiff`, `page_2.tiff` vb. içeren `filename_tiffs.zip`

Belirli bir sayfa için TIFF kodlaması başarısız olursa (sıkıştırma sorunları nedeniyle), o sayfa bunun yerine `.png` dosyası olarak kaydedilir. Bu durumda ZIP, TIFF ve PNG dosyalarının karışımını içerir.

## Kullanım Alanları

- Belgeleri TIFF biçimi gerektiren devlet kurumlarına veya hukuki sistemlere göndermek.
- Sayfaları dijital faks hizmetleri üzerinden faks iletimine hazırlamak.
- Taranmış belgeleri yaygın olarak desteklenen kayıpsız bir biçimde arşivlemek.
- Sayfaları kurumsal belge yönetim sistemlerine aktarmak.

## İpuçları

- TIFF dosyaları büyüktür. Yalnızca web veya ekran kullanımı için kayıpsız kaliteye ihtiyacınız varsa [PDF'den PNG'ye](./pdf-to-png) daha iyi bir seçimdir.
- Bazı sayfalar PNG yedeğine ihtiyaç duyduysa ZIP içeriğini kontrol edin: bunları ayrıca dönüştürmek isteyebilirsiniz.

## İlgili Araçlar

- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den BMP'ye](./pdf-to-bmp)
- [PDF'den JPG'ye](./pdf-to-jpg)
