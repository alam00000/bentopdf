---
title: PDF'den CSV'ye
description: PDF belgelerinden tabloları çıkarın ve tek bir CSV dosyası olarak dışa aktarın. Otomatik tablo algılamayla çok sayfalı PDF'leri destekler.
---

# PDF'den CSV'ye

Bir PDF'teki tabloları çıkarır ve CSV dosyası olarak dışa aktarır. Araç, her sayfayı PyMuPDF'in tablo algılama motoruyla tablo verileri için tarar, ardından bulunan tüm satırları virgülle ayrılmış tek bir çıktıya yazar.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Tablo çıkarmayı başlatmak için **CSV'ye Dönüştür** düğmesine tıklayın.
3. Araç her sayfayı tarar ve tabloları otomatik olarak belirler.
4. Çıkarılan tüm tablo verilerini içeren bir `.csv` dosyası iner.

Farklı sayfalardaki tablolar çıktıda boş satırlarla ayrılır. Virgül, tırnak veya satır sonu içeren hücreler RFC 4180'e uygun olarak düzgün biçimde kaçışlanır.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Belgede bulunan tüm tablolar çıkarılır ve tek bir CSV'de birleştirilir.

## Çıktı Biçimi

- Algılanan tüm tabloları içeren tek bir `filename.csv` dosyası.

## Kullanım Alanları

- PDF banka ekstrelerinden veya faturalardan mali verileri bir elektronik tabloya aktarmak.
- Karşılaştırma için tedarikçi tekliflerindeki fiyat tablolarını çıkarmak.
- PDF makalelerdeki tablo biçimli araştırma verilerini analiz araçlarına uygun bir biçime dönüştürmek.
- Eski PDF raporlarındaki verileri veritabanlarına taşımak.

## İpuçları

- Hiç tablo bulunamazsa araç "Tablo Bulunamadı" mesajı gösterir. Bu genellikle PDF'in tablo gibi görünen ancak gerçek bir tablo olarak yapılandırılmamış bir metin düzeni kullandığı anlamına gelir.
- Tek tek tablolar üzerinde daha fazla denetim için CSV, JSON ve Markdown çıktı biçimleri arasında seçim yapmanızı sağlayan [PDF Tablolarını Çıkar](./extract-tables) aracını kullanın.
- Verilere her tablo için ayrı sayfalar bulunan Excel biçiminde ihtiyacınız varsa [PDF'den Excel'e](./pdf-to-excel) aracını kullanın.

## İlgili Araçlar

- [PDF'den Excel'e](./pdf-to-excel)
- [PDF Tablolarını Çıkar](./extract-tables)
- [PDF'den Metne](./pdf-to-text)
