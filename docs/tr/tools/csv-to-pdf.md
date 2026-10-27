---
title: CSV'den PDF'ye
description: CSV e-tablo dosyalarını doğrudan tarayıcınızda biçimlendirilmiş PDF tablolarına dönüştürün.
---

# CSV'den PDF'ye

CSV dosyalarını temiz, biçimlendirilmiş PDF belgelerine dönüştürün. Her CSV ayrıştırılır ve çıktı PDF'de tablo olarak işlenir. Alıcının e-tablo yazılımına ihtiyaç duymadan tablo verilerini yazdırmanız veya paylaşmanız gerektiğinde kullanışlıdır.

## Desteklenen Biçimler

| Biçim | Uzantılar |
| :---- | :-------- |
| CSV   | `.csv`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya bir ya da daha fazla CSV dosyasını sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Daha fazla dosya ekleyin veya istemediklerinizi kaldırın.
3. **PDF'ye Dönüştür**'e tıklayın. Bir ilerleme göstergesi dönüştürme durumunu gösterir.
4. Tek dosya doğrudan PDF olarak iner. Birden çok dosya `csv-converted.zip` içinde paketlenir.

## Seçenekler

Bu aracın ek bir yapılandırması yoktur. CSV otomatik olarak ayrıştırılır ve tablo olarak biçimlendirilir.

## Çıktı

| Girdi Sayısı | Çıktı                                                        |
| :----------- | :----------------------------------------------------------- |
| 1 dosya      | Tek PDF indirmesi (örn. `data.pdf`)                          |
| 2+ dosya     | Dosya başına bir PDF içeren ZIP arşivi (`csv-converted.zip`) |

## Kullanım Alanları

- Dışa aktarılan veritabanı raporlarını yazdırılabilir PDF tablolarına dönüştürmek
- Finansal verileri veya envanter listelerini Excel'i olmayan kişilerle paylaşmak
- Uyumluluk belgeleri için CSV günlük dosyalarının PDF sürümlerini oluşturmak
- Adres listelerini, not çizelgelerini veya CSV olarak saklanan her türlü tablo verisini yazdırmak

## İpuçları

- En iyi sonuç için CSV'nizin standart virgül ayırıcıları kullandığından emin olun. Araç yaygın CSV ayrıştırma kurallarını izler.
- CSV'nizde çok sayıda sütun varsa tablo sayfa genişliğine sığması için sıkıştırılabilir. Geniş veri kümelerini birden çok dosyaya bölmeyi düşünün.
- Excel dosyaları (`.xls`, `.xlsx`) için e-tablo biçimlendirmesini ve birden çok sayfayı koruyan [Excel'den PDF'ye](./excel-to-pdf) aracını kullanın.

## İlgili Araçlar

- [Excel'den PDF'ye](./excel-to-pdf)
- [Metinden PDF'ye](./txt-to-pdf)
- [JSON'dan PDF'ye](./json-to-pdf)
