---
title: E-postadan PDF'ye
description: EML ve MSG e-posta dosyalarını tarayıcınızda PDF'ye dönüştürün. Üst bilgileri, gövdeyi ve ek listesini korur.
---

# E-postadan PDF'ye

Kaydedilmiş e-posta dosyalarını temiz, yazdırılabilir PDF'lere dönüştürün. Araç EML ve MSG dosyalarını ayrıştırır, mesajın tamamını (üst bilgiler, gövde içeriği ve ek üst verileri) çıkarır ve her şeyi yapılandırılmış bir PDF'ye işler. Hukuki keşif, kayıt tutma veya önemli bir e-postayı yazdırmak için kullanışlıdır.

## Desteklenen Biçimler

| Biçim | Uzantı | Notlar                                                                   |
| :---- | :----- | :----------------------------------------------------------------------- |
| EML   | `.eml` | Standart MIME e-posta biçimi (çoğu e-posta istemcisinden dışa aktarılır) |
| MSG   | `.msg` | Microsoft Outlook'un özel biçimi                                         |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya EML ya da MSG dosyalarınızı sürükleyip bırakın. Tek bir toplu işte iki biçimi birlikte kullanabilirsiniz.
2. Dosya listesini gözden geçirin. İstenmeyen girdileri çöp kutusu simgesiyle kaldırın veya daha fazla e-posta eklemek için **Daha Fazla Dosya Ekle**'ye tıklayın.
3. Dönüştürme seçeneklerini yapılandırın (aşağıya bakın).
4. **PDF'ye Dönüştür**'e tıklayın. Araç her e-postayı ayrıştırır, içeriği biçimlendirilmiş HTML olarak işler ve PyMuPDF motoruyla PDF'ye dönüştürür.
5. Tek bir e-posta doğrudan PDF olarak iner. Birden çok e-posta `emails-converted.zip` içinde paketlenir.

## Seçenekler

| Seçenek                   | Varsayılan | Açıklama                                                                                               |
| :------------------------ | :--------- | :----------------------------------------------------------------------------------------------------- |
| **Sayfa Boyutu**          | A4         | A4, Letter veya Legal sayfa boyutları arasında seçim yapın.                                            |
| **CC ve BCC'yi Dahil Et** | Açık       | Etkinleştirildiğinde CC ve BCC alıcı listeleri PDF'nin e-posta üst bilgi bölümünde görünür.            |
| **Ek Listesini Dahil Et** | Açık       | Etkinleştirildiğinde e-postanın dosya eklerinin listesi (dosya adları ve boyutlarıyla) PDF'de görünür. |

## Kullanım Alanları

- Uyumluluk veya denetim için önemli iş yazışmalarını PDF olarak arşivlemek
- Hukuki süreçler veya keşif talepleri için e-posta zincirlerini yazdırmak
- E-postayla alınan sipariş onaylarının, makbuzların veya sözleşmelerin kalıcı kaydını oluşturmak
- Outlook MSG dosyalarını okumak için Outlook gerektirmeyen bir biçimde yedeklemek
- Dışa aktarılmış EML dosyalarından müşteri destek görüşmelerini belgelemek

## İpuçları

- Hem EML (Thunderbird, Apple Mail ve çoğu e-posta istemcisi tarafından kullanılır) hem de Outlook MSG dosyaları desteklenir. E-postaları istemcinizden dışa aktarın ve doğrudan araca bırakın.
- HTML biçimli e-postalar PDF'de stillerini korur. Düz metin e-postalar temiz, okunaklı biçimlendirmeyle işlenir.
- Ek listesi dosya adlarını ve boyutlarını gösterir ancak gerçek ek dosyaları PDF'ye gömmez.

## İlgili Araçlar

- [XML'den PDF'ye](./xml-to-pdf)
- [XPS'ten PDF'ye](./xps-to-pdf)
