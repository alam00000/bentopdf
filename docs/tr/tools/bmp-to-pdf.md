---
title: BMP'den PDF'ye
description: BMP bit eşlem görsellerini doğrudan tarayıcınızda PDF biçimine dönüştürün, hiçbir sunucuya yükleme gerekmez.
---

# BMP'den PDF'ye

Windows Bitmap (BMP) dosyalarını PDF'ye dönüştürün. BMP, eski sistemlerde, tıbbi görüntülemede ve endüstriyel tarayıcılarda hâlâ bulunan sıkıştırılmamış bir görsel biçimidir. Bu araç, hiçbir şey kurmanıza gerek kalmadan bunları PDF'ye dönüştürür.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| BMP   | `.bmp`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya BMP dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Daha fazla dosya ekleyin veya istenmeyenleri kaldırın.
3. **PDF'ye Dönüştür**'e tıklayın. Çıktı `from_bmps.pdf` olarak indirilir.

Her BMP bir tuvale çizilir, PNG olarak dışa aktarılır ve ardından pdf-lib kullanılarak PDF'ye gömülür. Sayfa boyutu özgün görsel boyutlarıyla eşleşir.

## Seçenekler

Bu araç ek kalite ayarları sunmaz. Görseller PDF içinde özgün çözünürlüklerinde, kayıpsız PNG olarak gömülür.

## Kullanım Alanları

- BMP olarak saklanan eski taranmış belgeleri arşivlik PDF'lere dönüştürmek
- Eski Windows uygulamalarından alınan BMP ekran görüntülerini paylaşılabilir belgelere çevirmek
- Varsayılan olarak BMP üreten tıbbi veya endüstriyel tarayıcı çıktılarını işlemek
- Eski görsel arşivlerini daha taşınabilir bir biçime aktarmak

## İpuçları

- BMP dosyaları sıkıştırılmadığı için genellikle büyüktür. Görseller dahili olarak PNG olarak yeniden kodlandığı için ortaya çıkan PDF belirgin şekilde daha küçük olur.
- BMP dosyalarınızla birlikte başka görsel biçimleriniz de varsa, her şeyi tek seferde dönüştürmek için [Görselden PDF'ye](./image-to-pdf) aracını kullanın.

## İlgili Araçlar

- [Görselden PDF'ye](./image-to-pdf)
- [PNG'den PDF'ye](./png-to-pdf)
- [TIFF'den PDF'ye](./tiff-to-pdf)
