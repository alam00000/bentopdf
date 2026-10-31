---
title: Üst Bilgi & Alt Bilgi
description: PDF sayfalarına dinamik sayfa numarası değişkenleriyle özelleştirilebilir üst bilgi ve alt bilgi metni ekleyin.
---

# Üst Bilgi & Alt Bilgi

PDF sayfalarınızda altı konuma metin ekleyin: üst bilgi sol, üst bilgi orta, üst bilgi sağ, alt bilgi sol, alt bilgi orta ve alt bilgi sağ. Araç, sayfa numaraları ve toplam sayfa sayısı için dinamik değişkenleri destekler; böylece her sayfada otomatik güncellenen "Sayfa 3 / 10" gibi şablonlar oluşturabilirsiniz.

## Nasıl Çalışır

1. PDF dosyanızı yükleyin.
2. Biçimlendirme denetimlerini ve altı metin giriş alanını gösteren seçenekler paneli görünür.
3. İstediğiniz metni üst bilgi/alt bilgi konumlarından herhangi birine girin.
4. Dinamik sayfa numaralandırma için `{page}` ve `{total}` yer tutucularını kullanın.
5. Yazı tipi boyutunu ve rengini ayarlayın, isterseniz belirli bir sayfa aralığıyla sınırlayın.
6. İşlemek ve indirmek için **Üst Bilgi ve Alt Bilgi Ekle**'ye tıklayın.

## Seçenekler

- **Sayfa Aralığı**: Hangi sayfalara üst bilgi ve alt bilgi ekleneceğini isteğe bağlı olarak sınırlayın. Tüm sayfalara uygulamak için boş bırakın. Biçim: "1-3, 5" (virgülle ayrılmış aralıklar).
- **Yazı Tipi Boyutu**: 6 ile 24 punto arasında. Varsayılan 10'dur.
- **Yazı Tipi Rengi**: Renk seçiciyle istediğiniz rengi seçin.
- **Üst Bilgi Sol / Orta / Sağ**: Her sayfanın üst kısmı için metin alanları.
- **Alt Bilgi Sol / Orta / Sağ**: Her sayfanın alt kısmı için metin alanları.

## Özellikler

- Sayfa başına altı bağımsız metin konumu
- Geçerli sayfa numarasını ekleyen dinamik `{page}` değişkeni
- Toplam sayfa sayısını ekleyen dinamik `{total}` değişkeni
- Belirli sayfaları hedeflemek için sayfa aralığı filtreleme
- Özelleştirilebilir yazı tipi boyutu ve rengi
- Temiz, profesyonel çıktı için Helvetica yazı tipi

## Kullanım Alanları

- Bir raporun alt bilgi ortasına "Sayfa {page} / {total}" eklemek
- Üst bilgi soluna şirket adını, üst bilgi sağına belge tarihini yerleştirmek
- Hukuki belgelerin alt bilgisine gizlilik uyarıları eklemek
- Belirli sayfa aralıklarına belge revizyon numaralarını damgalamak

## İpuçları

- `{page}` ve `{total}` değişkenlerini tek bir alanda birleştirerek "Sayfa {page} / {total}" veya "{page}/{total}" gibi biçimler oluşturabilirsiniz.
- Çoğu alanı boş bırakıp yalnızca ihtiyacınız olan konumları doldurabilirsiniz. Boş alanlar atlanır.
- Görsel veya logo içeren daha karmaşık üst bilgiler için sayfanın üstüne konumlandırılmış [Filigran Ekle](./add-watermark) aracını kullanmayı düşünün.

## İlgili Araçlar

- [Sayfa Numaraları](./page-numbers)
- [Filigran Ekle](./add-watermark)
- [Bates Numaralandırma](./bates-numbering)
