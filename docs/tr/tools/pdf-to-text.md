---
title: PDF'den Metne
description: PDF dosyalarından düz metin içeriğini çıkarın. Birden fazla PDF'in toplu çıkarılmasını ve TXT dosyaları olarak çıktı almayı destekler.
---

# PDF'den Metne

PDF dosyalarındaki tüm metin içeriğini çıkarır ve düz `.txt` dosyaları olarak kaydeder. Toplu işlemeyi destekler: birden fazla PDF yükleyin ve her birinin metnini tek işlemde çıkarın. PyMuPDF ile çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin. Dosya listenizi Add More ve Clear düğmeleriyle yönetin.
2. İşlemeyi başlatmak için **Metni Çıkar** düğmesine tıklayın.
3. Tek bir dosya `filename.txt` olarak iner. Birden fazla dosya bir `pdf-to-text.zip` arşivi üretir.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Tüm metin içeriği, her sayfadan okuma sırasıyla çıkarılır.

## Çıktı Biçimi

- **Tek dosya**: `filename.txt`
- **Birden fazla dosya**: her girdi PDF'i için bir `.txt` içeren `pdf-to-text.zip`.

## Kullanım Alanları

- Tam metin arama dizinlemesi için PDF raporlarından gövde metnini çıkarmak.
- PDF e-kitapları veya makaleleri e-mürekkep cihazlarda okumak için düz metne dönüştürmek.
- Anahtar kelime analizi için sözleşmelerden veya hukuki belgelerden metin almak.
- Veri işleme betikleri için temiz metin elde etmek üzere PDF'lerden biçimlendirmeyi temizlemek.
- Doğal dil işleme için PDF arşivlerinden metin derlemi hazırlamak.

## İpuçları

- Taranmış PDF'ler (yalnızca görsel), çıkarılacak bir metin katmanı olmadığından boş metin dosyaları üretir. Taranmış belgeleri önce OCR'dan geçirin.
- Çıktı, PyMuPDF'in yorumladığı okuma sırasını korur; bu sıra genellikle soldan sağa ve yukarıdan aşağıyadır. Çok sütunlu düzenler iç içe geçmiş metin üretebilir.
- Başlıklar ve biçimlendirme içeren yapılandırılmış çıktı için [PDF'den Markdown'a](./pdf-to-markdown) aracını deneyin. Yapay zekaya hazır yapılandırılmış JSON için [PDF'yi Yapay Zeka için Hazırla](./prepare-pdf-for-ai) aracını kullanın.

## İlgili Araçlar

- [PDF'den Markdown'a](./pdf-to-markdown)
- [PDF'yi Yapay Zeka için Hazırla](./prepare-pdf-for-ai)
- [PDF'den Word'e](./pdf-to-word)
