---
title: Metinden PDF'ye
description: Düz metin dosyalarını veya yazılan metni özel yazı tipleri, renkler ve sayfa boyutlarıyla PDF'e dönüştürün.
---

# Metinden PDF'ye

Düz metni biçimlendirilmiş bir PDF'e dönüştürün. `.txt` dosyaları yükleyebilir veya doğrudan yerleşik metin düzenleyiciye yazabilirsiniz. Araç birden fazla yazı tipini, özel metin renklerini ve A0'dan A10'a, ayrıca US Letter, Legal ve Tabloid dahil geniş bir sayfa boyutu yelpazesini destekler.

## Desteklenen Biçimler

| Girdi                 | Uzantılar                           |
| :-------------------- | :---------------------------------- |
| Düz metin dosyaları   | `.txt`                              |
| Doğrudan metin girişi | Düzenleyiciye yazın veya yapıştırın |

## Nasıl Çalışır

1. Üstteki düğmeyi kullanarak girdi modunuzu seçin: **Dosya Yükle** veya **Metin Yaz**.
2. Yüklüyorsanız bir veya daha fazla `.txt` dosyasını sürükleyip bırakın ya da seçmek için tıklayın. Yazıyorsanız metninizi doğrudan metin alanına girin.
3. Biçimlendirme seçeneklerini yapılandırın: yazı tipi ailesi, yazı tipi boyutu, metin rengi ve sayfa boyutu.
4. **PDF Oluştur**'a tıklayın. Çıktı `text_to_pdf.pdf` olarak iner.

Birden fazla dosya yüklerken içerikleri aralarına boş satırlar konularak birleştirilir.

## Seçenekler

| Seçenek              | Değerler                                                                         | Varsayılan      |
| :------------------- | :------------------------------------------------------------------------------- | :-------------- |
| **Yazı Tipi Ailesi** | Helvetica (tırnaksız), Tiro (tırnaklı), Courier (tek aralıklı), Times (tırnaklı) | Helvetica       |
| **Yazı Tipi Boyutu** | 6 - 72 pt                                                                        | 12              |
| **Metin Rengi**      | Renk seçiciyle herhangi bir renk                                                 | Siyah (#000000) |
| **Sayfa Boyutu**     | ISO A0-A10, B0-B10, C0-C10, US Letter, Legal, Tabloid, Ledger, 11x17             | A4              |

Sağdan sola yazılan diller (Arapça, İbranice, Farsça, Urduca) otomatik olarak algılanır. Sağdan sola metin bulunduğunda metin yönü ve hizalama buna göre değişir.

## Kullanım Alanları

- Kod parçacıklarını veya günlük dosyalarını Courier yazı tipiyle yazdırılabilir bir PDF'e dönüştürmek
- Anında yazılan toplantı notlarından hızlıca bir PDF oluşturmak
- Düz metin bir el yazmasını teslim için belirli bir yazı tipi ve sayfa boyutuyla biçimlendirmek
- Bir README veya değişiklik günlüğünün çevrimdışı dağıtım için PDF sürümünü oluşturmak

## İpuçları

- Pano içeriğini önce dosya olarak kaydetmeden hızlıca dönüştürmek istediğinizde **Metin Yaz** modunu kullanın.
- Courier (tek aralıklı), kod, günlük veya sütun hizasının önemli olduğu her içerik için en iyi yazı tipi seçimidir.
- Sayfa kenar boşlukları her tarafta 72 punto (1 inç) olarak sabittir.

## İlgili Araçlar

- [Markdown'dan PDF'ye](./markdown-to-pdf)
- [CSV'den PDF'ye](./csv-to-pdf)
- [Word'den PDF'ye](./word-to-pdf)
