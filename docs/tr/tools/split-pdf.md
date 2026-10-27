---
title: PDF Böl
description: Bir PDF'i sayfa aralığına, görsel seçime, yer işaretlerine, çift/tek sayfalara veya sabit aralıklara göre daha küçük dosyalara bölün.
---

# PDF Böl

Bir PDF'i altı bölme modundan birini kullanarak daha küçük belgelere ayırın. Basit sayfa aralıklarından yer işaretine dayalı bölmeye kadar bu araç, bir belgeyi bölmenin her senaryosunu karşılar.

## Nasıl Çalışır

1. Tek bir PDF dosyası yükleyin.
2. Açılır listeden bir bölme modu seçin.
3. Moda özgü seçenekleri (sayfa aralıkları, seçimler vb.) yapılandırın.
4. İşle düğmesine tıklayın.
5. Sonuç, moda ve ayarlara bağlı olarak tek bir PDF veya bir ZIP arşivi olarak iner.

## Bölme Modları

| Mod                | Açıklama                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Aralık**         | `1-3, 5, 8-10` gibi sayfa aralıkları girin. Birden fazla aralık, ZIP içinde ayrı PDF'ler üretir. Tek aralık bir PDF üretir. |
| **Görsel Seçim**   | Sayfa küçük resimlerine göz atın ve istediğiniz sayfaları seçmek için tıklayın. Seçilen sayfalar yeni bir PDF'e çıkarılır.  |
| **Çift / Tek**     | Yalnızca çift numaralı veya tek numaralı sayfaları çıkarın.                                                                 |
| **Tüm Sayfalar**   | Her sayfayı ayrı bir PDF dosyasına bölün, ZIP olarak indirilir.                                                             |
| **Yer İşaretleri** | Yer işareti sınırlarında bölün. Bölmelerin nerede yapılacağını denetlemek için yer işareti düzeyini seçin.                  |
| **Her N Sayfada**  | Her biri N sayfalık parçalara bölün (örn. her 5 sayfada). Son parça daha az sayfa içerebilir.                               |

## Özellikler

- Hemen her kullanım senaryosunu kapsayan altı farklı bölme modu
- Tembel yüklenen küçük resimlere sahip görsel sayfa seçici
- Düzey filtrelemeli, yer işaretini dikkate alan bölme
- Aralık ve görsel modlar için ZIP çıktı seçeneği
- Karışık söz dizimli sayfa aralıklarını işler (`1-3, 5, 8-10`)
- N sayfalık bölmeler eşit olmayan parçalarla sonuçlandığında uyarı

## Kullanım Alanları

- Büyük bir belgeden belirli bir bölümü veya kısmı çıkarmak
- Çift taraflı yazdırma iş akışları için tek ve çift sayfaları ayırmak
- Bir kitap PDF'ini yer işareti sınırlarında tek tek bölüm dosyalarına ayırmak
- Bir sözleşmeden belirli sayfaları (imza sayfası gibi) ayırmak
- Derlenmiş bir raporu dağıtım için bölüm başına dosyalara bölmek

## İpuçları

- Virgülle ayrılmış birden fazla sayfa aralığı (örn. `1-5, 10-15, 20-25`), her aralık için bir tane olmak üzere ZIP içinde paketlenmiş ayrı PDF'ler üretir.
- Yer işareti bölme modu, PDF'in gerçekten yer işareti içermesini gerektirir. Hiç bulunamazsa bir hata mesajı alırsınız.
- Aralık ve Görsel modlardaki "ZIP olarak indir" kutusu, birleşik bir dosya yerine sayfa başına ayrı PDF'ler almanızı sağlar.

## İlgili Araçlar

- [PDF Birleştir](./merge-pdf)
- [Sayfaları Çıkar](./extract-pages)
- [Sayfaları Sil](./delete-pages)
- [PDF Çoklu Aracı](./pdf-multi-tool)
