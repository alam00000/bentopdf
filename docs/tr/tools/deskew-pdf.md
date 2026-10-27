---
title: PDF Eğriliğini Düzelt
description: OpenCV eğrilik algılamasıyla taranmış PDF'lerdeki eğik sayfaları otomatik olarak düzeltin. Ayarlanabilir eşik ve DPI değerleri.
---

# PDF Eğriliğini Düzelt

Taranmış belgeler nadiren tam düz olur. Hafif bir eğim bile OCR doğruluğunu düşürür ve baskının özensiz görünmesine yol açar. Bu araç, her sayfanın eğrilik açısını algılamak ve sayfayı yeniden düzleştirmek için OpenCV'nin görüntü işleme algoritmalarını kullanır.

## Nasıl Çalışır

1. Bir veya daha fazla taranmış PDF yükleyin.
2. **Eğrilik Eşiği**'ni ayarlayın: algılanan eğriliği bu değerin altında olan sayfalara dokunulmaz.
3. Bir **İşleme Kalitesi (DPI)** seçin: yüksek DPI algılama doğruluğunu artırır ancak daha uzun sürer.
4. **PDF Eğriliğini Düzelt**'e tıklayın.
5. İşlemden sonra bir sonuç paneli her sayfanın algılanan açısını ve düzeltilip düzeltilmediğini gösterir.

## Seçenekler

| Ayar              | Değerler                  | Varsayılan |
| ----------------- | ------------------------- | ---------- |
| **Eğrilik Eşiği** | 0,1, 0,5, 1,0, 2,0 derece | 0,5        |
| **İşleme DPI'ı**  | 100, 150, 200, 300        | 150        |

## Eğrilik Algılama Nasıl Çalışır

Araç her sayfayı seçilen DPI'da bir görsele dönüştürür, ardından içerikteki baskın çizgi açılarını algılamak için OpenCV kullanır. Algılanan eğrilik eşiği aşarsa sayfa, düzeltmek için ters açıyla döndürülür. Eşiğin altındaki sayfalar değiştirilmeden geçirilir.

## Kullanım Alanları

- Toplu taranmış sözleşmeleri veya hukuki belgeleri temizlemek
- Taranmış fişleri veya faturaları OCR işlemine hazırlamak
- Kâğıt yerleşimi tutarsız bir düz yataklı tarayıcıdan gelen sayfaları düzeltmek
- Dijitalleştirilmiş arşiv malzemelerinin görsel kalitesini iyileştirmek

## İpuçları

- OCR için piksel hassasiyetinde hizalamaya ihtiyacınız varsa eşiği 0,1 dereceye düşürün.
- 150 DPI çoğu belge için hızlı ve doğrudur. Çok küçük metinler veya ince ayrıntılı sayfalar için 300 DPI kullanın.
- Eğrilik düzeltme, net yatay metin satırları olan belgelerde en iyi sonucu verir. Çoğunlukla görsellerden veya çapraz tasarım öğelerinden oluşan sayfalarda zorlanabilir.

## İlgili Araçlar

- [PDF'yi Rasterleştir](./rasterize-pdf): düzeltilmiş çıktıyı düz, görsel tabanlı bir PDF'ye dönüştürün
- [PDF Sıkıştır](./compress-pdf): eğriliği düzelttikten sonra dosya boyutunu küçültün
- [PDF'yi Onar](./repair-pdf): taranmış PDF'lerdeki yapısal sorunları düzeltin
