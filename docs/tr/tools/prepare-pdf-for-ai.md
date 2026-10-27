---
title: PDF'yi Yapay Zeka için Hazırla
description: PDF içeriğini LLM'ler ve LlamaIndex gibi yapay zeka işlem hatları için optimize edilmiş yapılandırılmış JSON'a çıkarın. Toplu işlemeyi destekler.
---

# PDF'yi Yapay Zeka için Hazırla

PDF dosyalarındaki içeriği çıkarır ve büyük dil modelleri (LLM) ile LlamaIndex gibi yapay zeka çerçeveleri tarafından alınmaya uygun JSON olarak yapılandırır. Her sayfanın içeriği çıkarılır ve RAG işlem hatları, sohbet botları veya anlamsal arama sistemleri için hazır, yapılandırılmış bir biçimde düzenlenir.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin.
2. İşlemi başlatmak için **Çıkar**'a tıklayın.
3. Tek dosya `filename_llm.json` olarak iner. Birden fazla dosya `pdf-for-ai.zip` arşivi oluşturur.

Araç, meta verilerle birlikte sayfa düzeyinde içerik çıkarmak için PyMuPDF'in LlamaIndex entegrasyonunu kullanır ve yapay zeka çerçevelerine doğrudan yüklenebilecek çıktı üretir.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Tüm sayfalar tam metin ve meta verilerle çıkarılır.

## Çıktı Biçimi

- **Tek dosya**: `filename_llm.json`
- **Birden fazla dosya**: Her girdi PDF'i için bir `_llm.json` içeren `pdf-for-ai.zip`.

JSON çıktısı, sayfa başına metin içeriği ve meta veri alanları içeren LlamaIndex belge şemasını izler.

## Kullanım Alanları

- PDF belgelerini bilgi getirme destekli üretim (RAG) işlem hatları için hazırlamak.
- Bir yapay zeka sohbet botu için PDF arşivlerinden aranabilir bir bilgi tabanı oluşturmak.
- PDF raporlarını LLM tabanlı analiz iş akışlarına beslemek.
- Araştırma makalelerini anlamsal arama ve soru-cevap sistemleri için ön işlemden geçirmek.
- PDF belge koleksiyonlarından yapılandırılmış eğitim verisi oluşturmak.

## İpuçları

- Yapay zekaya özgü biçimlendirme olmadan düz metin çıkarmak için [PDF'den Metne](./pdf-to-text) aracını kullanın.
- Başlıkları ve yapıyı koruyan Markdown çıktısı için [PDF'den Markdown'a](./pdf-to-markdown) aracını kullanın.
- Taranmış PDF'ler boş veya çok az çıktı üretir. Çıkarma işleminden önce metin katmanı eklemek için OCR'dan geçirin.

## İlgili Araçlar

- [PDF'den Metne](./pdf-to-text)
- [PDF'den Markdown'a](./pdf-to-markdown)
- [PDF'den JSON'a](./pdf-to-json)
