---
title: Sayfa Boyutları
description: PDF sayfa boyutlarını, yönlerini, en-boy oranlarını ve dönüşünü analiz edin. Karışık boyutlu belgeleri tespit edin ve verileri CSV olarak dışa aktarın.
---

# Sayfa Boyutları

PDF'inizdeki her sayfayı okuyan ve tam boyutlarını, yönünü, standart boyut adını, en-boy oranını, alanını ve dönüşünü bildiren bir tanılama aracı. Yazdırmadan önce karışık boyutlu sayfaları yakalamak veya aldığınız bir PDF'in özelliklerini belgelemek için kullanışlıdır.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin. Analiz otomatik başlar: basılacak bir düğme yoktur.
2. Bir özet paneli toplam sayfa sayısını, benzersiz sayfa boyutlarının sayısını ve belgenin karışık boyutlu olup olmadığını gösterir.
3. Sayfa başına ayrıntıların bulunduğu tam sonuç tablosuna göz atın.
4. Görüntüleme birimlerini Nokta, İnç, Milimetre veya Piksel arasında değiştirin.
5. Verileri kaydetmek için **CSV'ye Aktar** düğmesine tıklayın.

## Bildirilen Alanlar

| Sütun          | Açıklama                                         |
| -------------- | ------------------------------------------------ |
| Sayfa #        | Sıralı sayfa numarası                            |
| Boyutlar       | Seçilen birimde Genişlik x Yükseklik             |
| Standart Boyut | Eşleşen ad (A4, Letter vb.) veya "Özel"          |
| Yön            | Dikey veya Yatay                                 |
| En Boy Oranı   | Genişliğin yüksekliğe oranı, ondalık sayı olarak |
| Alan           | Seçilen birimin karesi cinsinden sayfa alanı     |
| Döndürme       | Derece cinsinden sayfa dönüşü                    |

## Özellikler

- Standart kağıt boyutlarının otomatik tespiti (A3, A4, A5, Letter, Legal, Tabloid ve daha fazlası)
- Hangi boyutların göründüğünü ve her birini kaç sayfanın kullandığını gösteren, karışık boyutlu belge uyarısı
- Nokta, inç, milimetre ve piksel (96 PPI'da) arasında birim dönüştürme
- Elektronik tablolarda veya belgeleme sistemlerinde kullanmak için CSV dışa aktarımı

## Kullanım Alanları

- Bir belgeyi matbaaya göndermeden önce tüm sayfaların A4 olduğunu doğrulamak
- Birleştirilmiş bir PDF'in bazı sayfalarda neden beklenmedik kenar boşluklarıyla yazdırıldığını teşhis etmek
- Üst veri kayıtları için büyük bir PDF arşivinin sayfa düzenini belgelemek
- Düzeltilmesi gereken döndürülmüş sayfaları belirlemek

## İpuçları

- Özet "Karışık Boyutlar" gösteriyorsa, yazdırmadan önce standartlaştırmak için Sayfa Boyutunu Düzelt aracını kullanın.
- Dönüş alanı, doğru görüntülenen ancak sıfır olmayan bir dönüş özniteliğine sahip sayfaları belirlemenize yardımcı olur; bu, bazı iş akışlarında sorunlara yol açabilir.

## İlgili Araçlar

- [Sayfa Boyutunu Düzelt](./fix-page-size): karışık boyutlar belirlendikten sonra sayfaları standartlaştırın
- [PDF Sıkıştır](./compress-pdf): sayfa sorunlarını düzelttikten sonra PDF'i optimize edin
- [PDF'yi Döndür](./rotate-pdf): döndürülmüş sayfaları düzeltin
