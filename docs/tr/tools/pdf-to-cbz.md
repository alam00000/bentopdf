---
title: PDF'den CBZ'ye
description: Bir PDF'i Komga, Kavita, CDisplayEx ve Calibre gibi çizgi roman okuyucuları için CBZ (Comic Book Archive) dosyasına dönüştürün.
---

# PDF'den CBZ'ye

Bir PDF'i, dijital çizgi romanlar ve mangalar için standart biçim olan CBZ (Comic Book ZIP) dosyasına dönüştürür. Her PDF sayfası, arşiv içinde bir görsel olur. Araç, azami uyumluluk için üç biçimde üst veri oluşturur: ComicInfo.xml, metadata.opf ve ComicBookInfo JSON.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Görsel biçimini, kaliteyi, ölçeği ve isteğe bağlı üst veriyi seçin.
3. CBZ dosyasını oluşturmak için **Dönüştür** düğmesine tıklayın.
4. `.cbz` dosyası otomatik olarak iner.

## Seçenekler

| Seçenek          | Değerler        | Varsayılan | Açıklama                                                                                           |
| ---------------- | --------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Görüntü Formatı  | JPEG, PNG, WebP | JPEG       | Renkli çizgi romanlar için JPEG, kayıpsız siyah-beyaz manga için PNG, en iyi sıkıştırma için WebP. |
| Görüntü Kalitesi | 50–100%         | 85%        | JPEG/WebP sıkıştırmasını denetler. PNG için gizlidir (her zaman kayıpsız).                         |
| Ölçek            | 1.0x–4.0x       | 2.0x       | Yüksek ölçek, yüksek çözünürlüklü ekranlar için daha keskin görseller üretir.                      |
| Gri tonlama      | Açık/Kapalı     | Kapalı     | Sayfaları gri tonlamaya çevirir. Siyah-beyaz içerikte dosya boyutunu küçültür.                     |
| Manga modu       | Açık/Kapalı     | Kapalı     | Üst veride sağdan sola okuma yönünü ayarlar.                                                       |
| Üst veri ekle    | Açık/Kapalı     | Açık       | ComicInfo.xml, metadata.opf ve ComicBookInfo JSON'u gömer.                                         |

## Üst Veri Alanları

Üst veri etkinleştirildiğinde şunları doldurabilirsiniz:

- **Başlık**: PDF dosya adından otomatik algılanır.
- **Seri**: Seri adı (ör. "Naruto").
- **Numara (#)**: Seri içindeki sayı numarası.
- **Cilt**: Cilt numarası.
- **Yazar(lar)**: Yazar veya yaratıcı adı.
- **Yayıncı**: Yayıncı şirket.
- **Etiketler / Tür**: Virgülle ayrılmış etiketler (ör. "Action, Adventure").
- **Yayın Yılı**: Yayın yılı (1900–2100).
- **Puan**: 0 ile 5 arasında topluluk puanı.

## Üst Veri Uyumluluğu

Araç, her okuyucunun bulabilmesi için üst veriyi üç biçimde yazar:

| Biçim              | Konum              | Destekleyenler                              |
| ------------------ | ------------------ | ------------------------------------------- |
| ComicInfo.xml      | ZIP içindeki dosya | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | ZIP içindeki dosya | Calibre                                     |
| ComicBookInfo JSON | ZIP yorum alanı    | Calibre (yedek)                             |

## Çıktı Biçimi

- `filename.cbz`: numaralı sayfa görsellerini ve üst veri dosyalarını içeren bir ZIP arşivi.

Sayfa görselleri, okuyucuların bunları doğru sırada göstermesi için sıfır dolgulu numaralarla adlandırılır (`01.jpg`, `02.jpg` vb.).

## Kullanım Alanları

- Manga veya çizgi roman PDF'lerini çizgi roman okuyucularında kullanmak üzere dönüştürmek.
- Komga, Kavita veya Calibre'de dijital bir çizgi roman kütüphanesi oluşturmak.
- Taranmış çizgi romanları okuyucu dostu bir biçime dönüştürmek.
- Çizgi romanları okuma yönünü ve üst veriyi koruyan bir biçimde paylaşmak.

## İpuçları

- Renkli çizgi romanlar için **JPEG**, siyah-beyaz manga için **PNG** kullanın: PNG, siyah-beyaz içeriği çok verimli sıkıştırır.
- Dosya boyutunu önemli ölçüde küçültmek için manga için **Gri tonlamaya dönüştür** seçeneğini etkinleştirin.
- Kütüphane yöneticilerinin (Komga, Calibre) koleksiyonunuzu otomatik olarak düzenleyebilmesi için **Seri** ve **Numara (#)** alanlarını doldurun.
- **WebP** en iyi sıkıştırmayı sunar ancak eski çizgi roman okuyucuları bunu desteklemeyebilir.

## İlgili Araçlar

- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den TIFF'e](./pdf-to-tiff)
- [Görüntüleri Çıkar](./extract-images)
