---
title: SVG'den PDF'ye
description: SVG vektör grafiklerini kalite denetimiyle tamamen tarayıcınızda PDF'e dönüştürün.
---

# SVG'den PDF'ye

Ölçeklenebilir Vektör Grafiği (SVG) dosyalarını PDF'e dönüştürün. Araç her SVG'yi tarayıcının işleme motoruyla rasterleştirir, ardından sonucu özgün çözünürlüğünde gömer. Vektör simgeleri, diyagramları ve çizimleri taşınabilir belgelere dönüştürmek için kullanışlıdır.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| SVG   | `.svg`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya bir ya da daha fazla SVG dosyasını sürükleyip bırakın.
2. Dosya listesini gözden geçirin ve yönetin.
3. Bir **PDF Kalitesi** düzeyi seçin.
4. **PDF'e Dönüştür**'e tıklayın. Sonuç `from_svgs.pdf` olarak iner.

Her SVG metin olarak okunur, kendi iç genişliği ve yüksekliğinde (boyut belirtilmemişse varsayılan 800x600) bir tuvale işlenir ve PNG olarak dışa aktarılır. Ardından bu PNG, pdf-lib kullanılarak PDF'e gömülür. Saydam alanlar beyaz arka planla doldurulur.

## Seçenekler

**PDF Kalitesi**, rasterleştirmeden sonraki sıkıştırmayı denetler:

- **Yüksek Kalite**: özgün işlemeye en yakın.
- **Orta Kalite** (varsayılan): iyi bir denge.
- **Düşük Kalite**: en küçük dosya, bir miktar ayrıntı kaybı.

## Kullanım Alanları

- Mimari veya mühendislik diyagramlarını SVG'den baskıya hazır PDF'e dönüştürmek
- Simge setlerini bir tasarım sistemi için başvuru PDF'inde paketlemek
- Veri görselleştirmelerini (D3.js, grafik kitaplığı dışa aktarımları) rapora hazır PDF'lere dönüştürmek
- SVG tabanlı infografiklerin yazdırılabilir sürümlerini oluşturmak

## İpuçları

- Açık `width` ve `height` öznitelikleri olmayan SVG dosyaları 800x600 piksel olarak işlenir. En iyi sonuç için dönüştürmeden önce SVG kaynağında boyutları belirleyin.
- Harici yazı tipi başvuruları veya bağlı görseller içeren karmaşık SVG'ler kusursuz işlenmeyebilir. Güvenilir çıktı için tüm varlıkları SVG içine gömün.
- SVG rasterleştirildiği için PDF, vektör yolları yerine bir bitmap görsel içerir. Gerçek vektör PDF çıktısı için özel bir vektör aracı gerekir.

## İlgili Araçlar

- [Görselden PDF'ye](./image-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [BMP'den PDF'ye](./bmp-to-pdf)
