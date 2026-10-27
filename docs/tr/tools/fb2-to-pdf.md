---
title: FB2'den PDF'ye
description: FictionBook (FB2) e-kitap dosyalarını tarayıcınızda PDF'ye dönüştürün. Ücretsiz, gizli, sunucuya yükleme yok.
---

# FB2'den PDF'ye

FictionBook 2 (FB2) dosyalarını PDF belgelerine dönüştürün. FB2, Rusya ve Doğu Avrupa'da yaygın, XML tabanlı bir e-kitap biçimidir. Bazı platformlarda iyi desteklenirken diğerlerinde neredeyse hiç bilinmez. PDF'ye dönüştürmek kitaplarınızı her yerde okunabilir hale getirir.

## Desteklenen Biçimler

| Biçim         | Uzantı | Notlar                     |
| :------------ | :----- | :------------------------- |
| FictionBook 2 | `.fb2` | XML tabanlı e-kitap biçimi |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya FB2 dosyalarınızı sürükleyip bırakın. Birden fazla dosyayı toplu olarak seçebilirsiniz.
2. Dosya listesini gözden geçirin. Tek tek girişleri kaldırmak için çöp kutusu simgesini kullanın veya daha fazla dosya eklemek için **Daha Fazla Dosya Ekle**'ye tıklayın.
3. **PDF'ye Dönüştür**'e tıklayın. PyMuPDF motoru FB2 XML yapısını ayrıştırır ve sayfalara bölünmüş PDF içeriği olarak işler.
4. Tek bir dosya doğrudan PDF olarak iner. Birden fazla dönüşüm `fb2-converted.zip` içinde paketlenir.

## Seçenekler

Herhangi bir yapılandırma gerekmez. Dönüştürücü FB2 XML yapısını otomatik olarak işler; bölüm sonlarını, biçimlendirmeyi ve gömülü görselleri korur.

## Kullanım Alanları

- FB2 e-kitaplarını yalnızca PDF destekleyen cihazlarda veya uygulamalarda okumak
- FB2 biçiminde dağıtılan Rusça edebiyatı yazdırmak
- FB2 kitaplığını evrensel olarak desteklenen bir biçimde arşivlemek
- Okuyucusu FictionBook desteklemeyen biriyle kitap paylaşmak

## İpuçları

- FB2 dosyaları düz XML olduğundan genellikle küçüktür ve tarayıcıda bile hızlı dönüşür.
- FB2 dosyalarınız `.fb2.zip` olarak sıkıştırılmışsa, yüklemeden önce arşivden çıkarın.

## İlgili Araçlar

- [EPUB'dan PDF'ye](./epub-to-pdf)
- [MOBI'den PDF'ye](./mobi-to-pdf)
- [XML'den PDF'ye](./xml-to-pdf)
