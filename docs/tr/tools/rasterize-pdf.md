---
title: PDF'yi Rasterleştir
description: PDF sayfalarını görsel tabanlı PDF'e dönüştürün. Tüm katmanları düzleştirin, seçilebilir metni kaldırın, DPI ve görsel biçimini denetleyin.
---

# PDF'yi Rasterleştir

Rasterleştirme, bir PDF'in her sayfasını görsele dönüştürür ve bu görselleri yeniden bir PDF'te birleştirir. Sonuç özgün belgeyle aynı görünür ancak seçilebilir metin, etkileşimli öğe veya düzenlenebilir katman içermez. Kısacası yüksek kaliteli bir fotokopidir.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin.
2. Rasterleştirilmiş çıktı için **DPI** (çözünürlük) değerini ayarlayın.
3. Bir **Görsel Biçimi** seçin: kayıpsız kalite için PNG, daha küçük dosyalar için JPEG.
4. İsteğe bağlı olarak **Gri Tonlamaya Dönüştür**'ü işaretleyin.
5. **PDF'yi Rasterleştir**'e tıklayın. Birden fazla dosya ZIP olarak iner.

## Seçenekler

| Ayar              | Değerler                          | Varsayılan |
| ----------------- | --------------------------------- | ---------- |
| **DPI**           | 72, 150, 200, 300, 600            | 150        |
| **Görsel Biçimi** | PNG (kayıpsız), JPEG (daha küçük) | PNG        |
| **Gri tonlama**   | Açık/Kapalı                       | Kapalı     |

## DPI Yönergeleri

- **72**: Yalnızca ekranda görüntüleme, en küçük dosya boyutu
- **150**: Genel kullanım için iyi bir denge
- **200**: Daha keskin metin, orta dosya boyutu
- **300**: Baskı kalitesinde çıktı
- **600**: Yüksek kaliteli arşivleme veya profesyonel baskı

## Kullanım Alanları

- Gizli belgeleri paylaşmadan önce metin çıkarılmasını engellemek
- Metni piksellere dönüştürerek yazı tipi bağımlılığı sorunlarını ortadan kaldırmak
- Karmaşık katmanlar veya saydamlık içeren ve görüntüleyicilere göre farklı işlenen bir PDF'in "düz" sürümünü oluşturmak
- Bir PDF'i yalnızca görsel tabanlı girdi kabul eden bir sisteme hazırlamak
- PDF'i salt görsellere indirgeyerek gizli içeriği (izlenen değişiklikler veya form verileri gibi) temizlemek

## İpuçları

- PNG ile 150 DPI sağlam bir varsayılandır. Yalnızca baskı çıktısı gerekiyorsa veya ince ayrıntılara yakınlaşmanız gerekiyorsa daha yükseğe çıkın.
- JPEG belirgin biçimde daha küçük dosyalar üretir ancak keskin metin kenarlarında sıkıştırma artefaktları oluşturur.
- Rasterleştirme geri alınamaz. Daha sonra düzenlenebilir metne ihtiyacınız olabilirse özgün PDF'inizi saklayın.

## İlgili Araçlar

- [PDF Sıkıştır](./compress-pdf): rasterleştirilmiş PDF'in dosya boyutunu küçültün
- [Eğrilik Düzelt](./deskew-pdf): taranmış belgeleri rasterleştirmeden önce sayfaları düzeltin
- [Yazı Tipini Ana Hatta Dönüştür](./font-to-outline): ölçeklenebilirliği korumak istiyorsanız yazı tiplerini vektör yollarına dönüştürün
- [PDF'yi Düzleştir](./flatten-pdf): formları görsele dönüştürmeden düzleştirin
