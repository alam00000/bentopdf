---
title: JPG'den PDF'ye
description: Bir veya daha fazla JPG, JPEG ve JPEG 2000 görselini doğrudan tarayıcınızda tek bir PDF dosyasına dönüştürün.
---

# JPG'den PDF'ye

JPG görsellerini temiz bir PDF'ye dönüştürün. Tek bir dosya yükleyin veya birden fazla JPG'yi toplu olarak ekleyin; her görsel çıktı belgesinde tam boyutlu bir sayfa olur.

## Desteklenen Biçimler

| Biçim     | Uzantılar       |
| :-------- | :-------------- |
| JPEG      | `.jpg`, `.jpeg` |
| JPEG 2000 | `.jp2`, `.jpx`  |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya JPG dosyalarınızı sürükleyip bırakın. Çoklu seçim desteklenir.
2. Yüklenen dosyaları gözden geçirin. Tek tek dosyaları kaldırmak için çöp kutusu simgesini kullanın veya listeye eklemek için **Daha Fazla Dosya Ekle**'ye tıklayın.
3. Bir **PDF Kalitesi** düzeyi seçin.
4. **PDF'ye Dönüştür**'e tıklayın. Araç görselleri kalite ayarınıza göre sıkıştırır, PyMuPDF motoruyla dönüştürür ve `from_jpgs.pdf` dosyasını indirir.

## Seçenekler

**PDF Kalitesi**, her görsel PDF'ye gömülmeden önce uygulanan sıkıştırmayı ayarlar:

- **Yüksek Kalite**: azami ayrıntıyı korur. Fotoğrafçılık veya baskı için kullanın.
- **Orta Kalite** (varsayılan): netlik ile dosya boyutu arasında sağlam bir denge.
- **Düşük Kalite**: en küçük çıktı için agresif sıkıştırma.

## Kullanım Alanları

- JPG olarak kaydedilmiş taranmış belgeleri tek bir başvuru PDF'sine dönüştürmek
- Ürün fotoğraflarını müşteriler için bir kataloğa paketlemek
- JPEG 2000 tıbbi veya uydu görüntülerini taşınabilir bir PDF'ye çevirmek
- Kamera dışa aktarımlarından yazdırılabilir bir fotoğraf albümü oluşturmak

## İpuçları

- JPEG 2000 dosyaları (`.jp2`, `.jpx`) yalnızca standart JPEG değil, tam olarak desteklenir. Bu, tıbbi görüntüleme ve coğrafi veriler için kullanışlıdır.
- JPG'leriniz telefon kamerasından geliyorsa Orta kalite genellikle ekranda görünür bir fark olmadan Yüksek'ten %40-60 daha küçük bir dosya üretir.

## İlgili Araçlar

- [Görselleri PDF'ye](./image-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [WebP'den PDF'ye](./webp-to-pdf)
