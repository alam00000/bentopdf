---
title: PDF'yi Gri Tonlamaya Çevir
description: Renkli bir PDF'i gri tonlamalı (siyah-beyaz) sürüme dönüştürün. Her sayfadaki tüm rengin kaldırıldığı yeni bir PDF üretir.
---

# PDF'yi Gri Tonlamaya Çevir

Renkli bir PDF'i gri tonlamalı sürüme dönüştürür. Her sayfa işlenir, doygunluğu azaltılır ve yeni bir PDF'e JPEG görseli olarak yeniden gömülür. Çıktı, özgün sayfa boyutlarını korur.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Dosyayı işlemek için **Gri Tonlamaya Dönüştür** düğmesine tıklayın.
3. Tüm sayfaları siyah-beyaza çevrilmiş yeni bir `greyscale.pdf` iner.

Arka planda her sayfa 2x ölçekte işlenir, piksel verisi bir gri tonlama filtresinden geçirilir, ardından %90 kalitede JPEG olarak yeniden kodlanır ve yeni bir PDF belgesine yerleştirilir.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Gri tonlama dönüştürmesi standart bir parlaklık formülü kullanır ve JPEG kalitesi %90'a sabitlenmiştir.

## Çıktı Biçimi

- Tüm sayfaları gri tonlamalı JPEG görselleri olarak içeren tek bir `greyscale.pdf` dosyası.

## Kullanım Alanları

- Renkli mürekkep maliyetinden tasarruf etmek için belgeleri siyah-beyaz baskıya hazırlamak.
- Gri tonlama zorunlu kılan hukuki veya resmi başvuru gereksinimlerini karşılamak.
- Renk ağırlıklı PDF'lerde dosya boyutunu küçültmek (gri tonlamalı JPEG görseller renklilerden küçüktür).
- Renkli ve siyah-beyaz sayfaların karışık olduğu belgelerde tutarlı bir görsel stil oluşturmak.

## İpuçları

- Her sayfa rasterleştirilip JPEG olarak yeniden gömüldüğünden çıktı görsel tabanlıdır. Özgün PDF'teki metin artık seçilemez ve aranamaz. Sonrasında aranabilir metne ihtiyacınız varsa çıktıyı OCR aracından geçirin.
- Renk ayarları (parlaklık, kontrast, doygunluk) üzerinde daha fazla denetim için Renkleri Ayarla aracına veya [PDF İş Akışı Oluşturucu](./pdf-workflow) içindeki Greyscale düğümüne bakın.

## İlgili Araçlar

- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF'den PNG'ye](./pdf-to-png)
- [PDF İş Akışı Oluşturucu](./pdf-workflow)
