---
title: PDF Tablolarını Çıkar
description: PDF belgelerindeki tabloları algılayın ve çıkarın. Tablo bazında ayrıntıyla CSV, JSON veya Markdown olarak dışa aktarın.
---

# PDF Tablolarını Çıkar

Bir PDF'deki tüm tabloları algılar ve bunları seçtiğiniz biçimde dışa aktarmanızı sağlar: CSV, JSON veya Markdown. Her tablo sayfa ve konum üst verisiyle tek tek çıkarılır. PyMuPDF'in tablo algılama motoruyla çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. Tercih ettiğiniz **dışa aktarma biçimini** seçin: CSV, JSON veya Markdown.
3. İşlemeyi başlatmak için **Çıkar**'a tıklayın.
4. Tek tablo bulunursa tek dosya olarak iner. Birden çok tablo, tablo başına bir dosya içeren bir ZIP arşivi üretir.

## Seçenekler

- **Dışa Aktarma Biçimi**: şunlar arasında seçim yapın:
  - **CSV**: virgül, tırnak veya yeni satır içeren alanlar için doğru tırnaklamayla virgülle ayrılmış değerler. E-tablolar ve veritabanları için uygundur.
  - **JSON**: dizi dizisi yapısı, 2 boşluk girintiyle okunaklı biçimlendirilmiş. Programatik kullanım için uygundur.
  - **Markdown**: PyMuPDF tarafından işlenen dikey çizgiyle ayrılmış tablo biçimi. Belgeler ve README dosyaları için uygundur.

## Çıktı Biçimi

- **Tek tablo**: `filename_table.csv` (veya `.json` / `.md`)
- **Birden çok tablo**: `table_1_page3.csv`, `table_2_page5.csv` vb. adlı dosyaları içeren `filename_tables.zip`

## Kullanım Alanları

- Tüm belgenin verilerini çekmeden uzun PDF raporlarından belirli tabloları çıkarmak.
- Tabloları GitHub issue'larına, wiki'lere veya belgelere doğrudan yapıştırmak üzere Markdown biçiminde almak.
- API entegrasyonları veya betikler için PDF tablolarından yapılandırılmış JSON verisi çıkarmak.
- Farklı PDF sürümlerindeki tabloları her ikisini de CSV'ye aktarıp farklarını karşılaştırarak kıyaslamak.

## İpuçları

- Bu araç tablo bazında denetim sağlar. Tüm tabloları tek bir CSV'ye dökmek istiyorsanız [PDF'den CSV'ye](./pdf-to-csv) aracını kullanın. Tam bir Excel çalışma kitabı için [PDF'den Excel'e](./pdf-to-excel) aracını kullanın.
- Birden çok sayfaya yayılan tablolar sayfa başına ayrı tablolar olarak algılanabilir. Bunları elle birleştirmeniz gerekebilir.
- Hiç tablo algılanmazsa PDF taranmış bir görüntü olabilir. Metin katmanı eklemek için önce OCR'den geçirin.

## İlgili Araçlar

- [PDF'den CSV'ye](./pdf-to-csv)
- [PDF'den Excel'e](./pdf-to-excel)
- [PDF'den Metne](./pdf-to-text)
