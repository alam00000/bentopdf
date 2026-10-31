---
title: PDF'den Word'e
description: PDF dosyalarını düzenlenebilir Word (DOCX) belgelerine dönüştürün. Birden fazla PDF'in aynı anda toplu dönüştürülmesini destekler.
---

# PDF'den Word'e

PDF dosyalarını düzenlenebilir Word (`.docx`) belgelerine dönüştürür. Araç, belge içeriğini yeniden oluşturmak için PyMuPDF kullanır ve metni, temel biçimlendirmeyi ve düzeni korur. Tekli ve toplu dönüştürmeyi destekler.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin. Listeye daha fazla dosya ekleyebilir veya tek tek dosyaları kaldırabilirsiniz.
2. İşlemeyi başlatmak için **DOCX'e Dönüştür** düğmesine tıklayın.
3. Tek bir dosya `filename.docx` olarak iner. Birden fazla dosya `converted-documents.zip` içinde paketlenir.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Her PDF, PyMuPDF'in yerleşik dönüştürme motoruyla DOCX'e dönüştürülür.

## Çıktı Biçimi

- **Tek dosya**: `filename.docx`
- **Birden fazla dosya**: her girdi PDF'i için bir `.docx` içeren `converted-documents.zip`.

## Kullanım Alanları

- Aldığınız ve değiştirmeniz gereken bir PDF'teki metni düzenlemek.
- Arşivlenmiş PDF raporlarını meslektaşların Microsoft Word veya Google Docs'ta düzenleyebileceği bir biçime dönüştürmek.
- PDF sözleşmelerinden veya tekliflerden içeriği düzeltme işaretleri için Word'e aktarmak.
- Eski PDF belgelerini düzenlenebilir bir biçime taşımak.

## İpuçları

- Çok sütunlu metin, gömülü formlar veya yoğun grafikler içeren karmaşık düzenler mükemmel dönüşmeyebilir. Çıktıyı gözden geçirin ve biçimlendirmeyi kelime işlemcinizde düzeltin.
- Taranmış PDF'ler (yalnızca görsel) boş veya çok az içerikli DOCX dosyaları üretir. Bir metin katmanı eklemek için önce OCR'dan geçirin.
- Toplu mod, PDF'lerin tüm klasörlerini dönüştürmek için verimlidir: hepsini birden yükleyin.

## İlgili Araçlar

- [PDF'den Metne](./pdf-to-text)
- [PDF'den Markdown'a](./pdf-to-markdown)
- [PDF İş Akışı Oluşturucu](./pdf-workflow)
