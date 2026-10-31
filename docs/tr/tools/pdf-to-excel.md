---
title: PDF'den Excel'e
description: PDF belgelerindeki tabloları bir Excel elektronik tablosuna çıkarın. Her tablo, sayfa başvurusuyla kendi çalışma sayfasında yer alır.
---

# PDF'den Excel'e

Bir PDF'teki tabloları çıkarır ve Excel (`.xlsx`) elektronik tablosu olarak kaydeder. Algılanan her tablo, tablo numarası ve kaynak sayfasıyla etiketlenmiş kendi çalışma sayfasına yerleştirilir. Tablo algılama için PyMuPDF, Excel oluşturma için SheetJS kütüphanesi kullanılır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Tablo çıkarmayı başlatmak için **Excel'e Dönüştür** düğmesine tıklayın.
3. Araç her sayfayı tablolar için tarar, ardından bir Excel çalışma kitabı oluşturur.
4. Tablo başına bir sayfa içeren bir `.xlsx` dosyası iner.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Algılanan tüm tablolar otomatik olarak çıkarılır.

## Çıktı Biçimi

- Tek bir `filename.xlsx` dosyası.
- **Tek tablo**: "Table" adlı tek bir çalışma sayfası.
- **Birden fazla tablo**: "Table 1 (Page 3)", "Table 2 (Page 5)" vb. adlı çalışma sayfaları. Sayfa adları 31 karaktere kısaltılır (Excel sınırı).

## Kullanım Alanları

- PDF mali raporlarını daha fazla analiz için düzenlenebilir elektronik tablolara dönüştürmek.
- Tedarikçi PDF'lerinden envanter veya sipariş tablolarını çıkarmak.
- PDF formlarından veya kataloglarından yapılandırılmış verileri sıralama ve filtreleme için Excel'e aktarmak.
- Tablo biçimli PDF verilerini teknik olmayan meslektaşların çalışabileceği bir biçimde arşivlemek.

## İpuçları

- Araç "Tablo Bulunamadı" bildirirse, PDF büyük olasılıkla yapılandırılmış tablolar yerine serbest akışlı bir metin düzeni kullanıyordur. Ham içeriği almak için bunun yerine [PDF'den Metne](./pdf-to-text) aracını deneyin.
- Daha basit, düz bir biçim için [PDF'den CSV'ye](./pdf-to-csv) aracını kullanın. Birden fazla biçimde tablo başına indirme için [PDF Tablolarını Çıkar](./extract-tables) aracını kullanın.
- Her tablonun hangi sayfadan geldiğini belirlemek için sayfa adlarına bakın.

## İlgili Araçlar

- [PDF'den CSV'ye](./pdf-to-csv)
- [PDF Tablolarını Çıkar](./extract-tables)
- [PDF'den Metne](./pdf-to-text)
