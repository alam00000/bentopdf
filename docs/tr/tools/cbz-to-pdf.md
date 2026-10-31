---
title: CBZ'den PDF'ye
description: CBZ ve CBR çizgi roman arşivlerini tarayıcınızda PDF'ye dönüştürün. Ücretsiz, gizli, yükleme gerekmez.
---

# CBZ'den PDF'ye

Çizgi roman arşiv dosyalarını PDF'ye dönüştürün. CBZ ve CBR, dijital çizgi romanlar için standart biçimlerdir: görsellerle dolu ZIP veya RAR arşivlerinden ibarettirler. Bu araç her sayfayı çıkarır, okuma sırasını korur ve her görselin tam boyutlu bir sayfa olduğu temiz bir PDF üretir.

## Desteklenen Biçimler

| Biçim | Uzantı | Notlar                                                      |
| :---- | :----- | :---------------------------------------------------------- |
| CBZ   | `.cbz` | ZIP tabanlı çizgi roman arşivi (pdf-lib ile yerel işlenir)  |
| CBR   | `.cbr` | RAR tabanlı çizgi roman arşivi (PyMuPDF motoru ile işlenir) |

CBZ dönüştürücü, arşiv içindeki JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC ve JXL görsellerini tanır. Standart olmayan biçimler gömülmeden önce otomatik olarak PNG'ye dönüştürülür.

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya CBZ ya da CBR dosyalarınızı sürükleyip bırakın. Tek bir toplu işte iki biçimi birlikte kullanabilirsiniz.
2. Listelenen dosyaları gözden geçirin. İstemediklerinizi kaldırın veya daha fazla eklemek için **Daha Fazla Dosya Ekle**'ye tıklayın.
3. **PDF'ye Dönüştür**'e tıklayın. CBZ dosyaları için araç arşivi açar, görsel dosyalarını doğal sırayla ada göre sıralar, her görselin gerçek biçimini algılar ve pdf-lib ile bir PDF'ye gömer. CBR dosyaları bunun yerine PyMuPDF motoru üzerinden işlenir.
4. Tek dosya PDF olarak iner. Birden çok dosya, `comic-converted.zip` adlı bir ZIP arşivi oluşturur.

## Seçenekler

Yapılandırma gerekmez. Her görsel, özgün boyutlarına uygun bir sayfa olur; böylece çift sayfa açılımlar geniş, tek sayfalar dar kalır.

## Kullanım Alanları

- PDF'yi destekleyen ama CBZ/CBR'yi desteklemeyen bir tablet veya telefon uygulamasında çizgi roman okumak
- Dijital bir çizgi romanın belirli sayfalarını yazdırmak
- Bir çizgi roman koleksiyonunu her dosya görüntüleyicinin açabildiği bir biçimde arşivlemek
- Özel bir çizgi roman okuyucusu olmayan biriyle çizgi roman paylaşmak

## İpuçları

- Arşivdeki görseller doğal sıralamayla sıralanır (böylece `page2.jpg`, `page10.jpg` dosyasından önce gelir). Doğru sayfa sırası için dosyalarınızı tutarlı numaralandırın.
- Dönüştürücü görsel biçimlerini dosya uzantılarına göre değil, ikili imzalarına göre algılar. Yanlışlıkla `.jpg` olarak adlandırılmış bir PNG yine de doğru şekilde gömülür.
- CBZ dosyaları PyMuPDF motoru yüklenmeden tamamen tarayıcıda işlenir, bu yüzden CBR dosyalarından daha hızlı dönüşür.

## İlgili Araçlar

- [EPUB'dan PDF'ye](./epub-to-pdf)
- [MOBI'den PDF'ye](./mobi-to-pdf)
- [Görselden PDF'ye](./image-to-pdf)
