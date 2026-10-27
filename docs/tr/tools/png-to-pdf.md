---
title: PNG'den PDF'ye
description: Bir veya daha fazla PNG görselini, ayarlanabilir kaliteyle tamamen tarayıcınızda bir PDF belgesine dönüştürün.
---

# PNG'den PDF'ye

PNG görsellerini tam çözünürlüklerini koruyarak PDF'ye dönüştürün. Her PNG, özgün görsel boyutlarına uygun boyutta kendi sayfası olur. Saydamlık otomatik olarak işlenir.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| PNG   | `.png`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya PNG dosyalarını sürükleyip bırakın. Aynı anda birkaçını seçebilirsiniz.
2. Dosya listesini yönetin: istemediğiniz dosyaları kaldırın veya daha fazlasını ekleyin.
3. Açılır listeden bir **PDF Kalitesi** düzeyi seçin.
4. **PDF'ye Dönüştür** düğmesine tıklayın. Çıktı `from_jpgs.pdf` olarak iner.

Araç, her görseli doğrudan gömmek için pdf-lib kullanır. Bir PNG yerel olarak gömülemezse (ör. alışılmadık bir renk profili nedeniyle), bir canvas üzerinden JPEG olarak yeniden işlenmeye geçer.

## Seçenekler

**PDF Kalitesi**, gömmeden önce uygulanan sıkıştırmayı denetler:

- **Yüksek Kalite**: minimum sıkıştırma, en büyük dosya boyutu.
- **Orta Kalite** (varsayılan): boyut ve netlik arasında iyi bir denge.
- **Düşük Kalite**: maksimum sıkıştırma, en küçük çıktı.

## Kullanım Alanları

- Hata raporları veya belgeler için ekran görüntülerini çok sayfalı bir PDF'ye dönüştürmek
- Arayüz tasarımı dışa aktarımlarını inceleme için tek bir dosyada paketlemek
- Diyagram dışa aktarımlarını (draw.io, Excalidraw) paylaşılabilir bir PDF'ye çevirmek
- Bir grup grafik görselini bir rapor halinde birleştirmek

## İpuçları

- Saydamlık içeren PNG dosyaları PDF'de beyaz arka plan alır. Farklı bir arka plana ihtiyacınız varsa görselleri önceden düzenleyin.
- Keskin kenarlı ve metinli ekran görüntüleri ile diyagramlar için High kalite, JPEG sıkıştırma artefaktlarını önler. Medium veya Low dahili olarak JPEG'e dönüştürebilir.

## İlgili Araçlar

- [Görselden PDF'ye](./image-to-pdf)
- [JPG'den PDF'ye](./jpg-to-pdf)
- [SVG'den PDF'ye](./svg-to-pdf)
