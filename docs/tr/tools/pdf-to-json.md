---
title: PDF'den JSON'a
description: CPDF kullanarak PDF dosyalarını yapılandırılmış JSON biçimine dönüştürün. PDF'in iç yapısını makine tarafından okunabilir JSON verisi olarak dışa aktarır.
---

# PDF'den JSON'a

Bir veya daha fazla PDF dosyasını JSON biçimine dönüştürür. Araç, her PDF'in iç yapısını makine tarafından okunabilir bir JSON gösterimine serileştirmek için CPDF (Coherent PDF) kullanır. Çıktı her zaman bir ZIP arşivi olarak sunulur.

## Nasıl Çalışır

1. Dosya seçiciyle bir veya daha fazla PDF dosyası seçin.
2. İşlemeyi başlatmak için **JSON'a Dönüştür** düğmesine tıklayın. Dönüştürme arka planda bir web worker içinde çalışır.
3. Her girdi PDF'i için bir JSON dosyası içeren bir ZIP arşivi iner.

Durum çubuğu, dönüştürme ve ZIP oluşturma aşamalarındaki ilerlemeyi gösterir.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Her PDF, tam JSON gösterimine dönüştürülür.

## Çıktı Biçimi

- Her girdi PDF'i için `filename.json` içeren bir `pdfs-to-json.zip` dosyası.

JSON çıktısı, PDF'in sayfa ağaçları, yazı tipi başvuruları, üst veri ve içerik akışları dahil iç nesne yapısını temsil eder.

## Kullanım Alanları

- Hata ayıklama veya doğrulama için bir PDF'in iç yapısını incelemek.
- Yapılandırılmış üst veriyi ve sayfa özelliklerini programatik olarak çıkarmak.
- PDF yapı verilerini özel işleme hatlarına aktarmak.
- PDF belgelerini nesne ağaçlarını analiz ederek uyumluluk açısından denetlemek.

## İpuçları

- Bu araç, çıkarılmış metin içeriğini değil, ham PDF nesne yapısını çıktı olarak verir. Sayfa metnine JSON biçiminde ihtiyacınız varsa bunun yerine [PDF'yi Yapay Zeka için Hazırla](./prepare-pdf-for-ai) aracını kullanın.
- Düz metin çıkarma için [PDF'den Metne](./pdf-to-text) daha basittir.
- Karmaşık yapılı büyük PDF'ler çok büyük JSON dosyaları üretir.

## İlgili Araçlar

- [PDF'den Metne](./pdf-to-text)
- [PDF'yi Yapay Zeka için Hazırla](./prepare-pdf-for-ai)
- [PDF Tablolarını Çıkar](./extract-tables)
