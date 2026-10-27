---
title: PDF'de OCR
description: Tesseract OCR ile taranmış PDF'leri çok dilli destek ve karakter filtrelemeyle aranabilir ve kopyalanabilir hale getirin.
---

# PDF'de OCR

Taranmış belgeleri aranabilir, kopyalanabilir PDF'lere dönüştürün. Araç, görsellerdeki metni tanımak için Tesseract OCR'ı kullanır ve özgün sayfaların üzerine görünmez bir metin katmanı ekler; böylece görsel görünüm korunurken içerik tamamen aranabilir hale gelir.

## Nasıl Çalışır

1. Taranmış veya görsel tabanlı bir PDF dosyası yükleyin.
2. Aranabilir dil listesinden belgede bulunan bir veya daha fazla dili seçin.
3. İsteğe bağlı olarak gelişmiş ayarları (çözünürlük, ikili hale getirme, izin listesi) düzenleyin.
4. **OCR'ı Başlat**'a tıklayın ve ilerlemeyi gerçek zamanlı ilerleme çubuğundan izleyin.
5. Tamamlandığında ayıklanan metni inceleyin, ardından aranabilir PDF'yi veya düz `.txt` dosyasını indirin.

## Özellikler

- Aranabilir dil seçicisiyle çok dilli OCR
- Görünmez metin katmanı özgün belge görünümünü korur
- İşlem sırasında gerçek zamanlı ilerleme çubuğu ve günlük çıktısı
- Sonuçları aranabilir PDF veya düz metin dosyası olarak indirme
- Ayıklanan metni doğrudan panoya kopyalama
- Hız ile doğruluğu dengelemek için üç çözünürlük düzeyi

## Seçenekler

| Ayar                                  | Değerler                                                                                           | Varsayılan | Amaç                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| **Çözünürlük**                        | Standart (192 DPI), Yüksek (288 DPI), Ultra (384 DPI)                                              | Yüksek     | Yüksek çözünürlük küçük metinde doğruluğu artırır ancak daha uzun sürer        |
| **Görseli İkili Hale Getir**          | Açık / Kapalı                                                                                      | Kapalı     | Temiz taramalarda siyah beyaza dönüştürerek kontrastı artırır                  |
| **Karakter İzin Listesi Hazır Ayarı** | Yok, Alfanümerik, Sayılar + Para Birimi, Yalnızca Harfler, Yalnızca Sayılar, Fatura, Formlar, Özel | Yok        | Belirli belge türlerinde doğruluğu artırmak için tanınan karakterleri kısıtlar |
| **Karakter İzin Listesi**             | Serbest metin                                                                                      | Boş        | Hazır ayar Özel olduğunda elle karakter kümesi                                 |

## Kullanım Alanları

- Taranmış sözleşmeleri ve faturaları Ctrl+F ile aranabilir hale getirmek
- Fotoğrafı çekilmiş belgelerden veya eski kağıt kayıtlardan metin ayıklamak
- Fatura hazır ayarıyla fişleri işleyerek tutarları ve tarihleri doğru yakalamak
- Uyumluluk gereksinimleri için yalnızca görsel taramalardan erişilebilir PDF'ler oluşturmak
- Taranmış kitaplardan veya kılavuzlardan metin içeriğini toplu ayıklamak

## İpuçları

- Belgeniz karışık dilli içerik barındırıyorsa (ör. İngilizce başlıklar ve Japonca gövde metni) birden fazla dil seçin.
- Soluk veya düşük kontrastlı metin içeren belgeler için ikili hale getirme seçeneğini kullanın; tanıma doğruluğunu önemli ölçüde artırabilir.
- Fatura ve Formlar izin listesi hazır ayarları, ilgisiz karakter şekillerini yok sayarak yapılandırılmış belgelerdeki yanlış pozitifleri büyük ölçüde azaltır.

## İlgili Araçlar

- [Tabloları Ayıkla](./extract-tables)
- [PDF Birleştir](./merge-pdf)
- [PDF Sıkıştır](./compress-pdf)
