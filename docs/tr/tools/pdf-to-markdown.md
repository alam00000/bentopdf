---
title: PDF'den Markdown'a
description: PDF belgelerini isteğe bağlı görsel çıkarmayla Markdown biçimine dönüştürün. Birden fazla dosyanın toplu dönüştürülmesini destekler.
---

# PDF'den Markdown'a

PDF dosyalarını başlıkları, paragrafları, listeleri ve temel biçimlendirmeyi koruyarak Markdown (`.md`) biçimine dönüştürür. İsteğe bağlı olarak gömülü görselleri çıkarıp ekler. Tekli ve toplu dönüştürmeyi destekler. PyMuPDF ile çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin.
2. İsteğe bağlı olarak, çıkarılan görselleri Markdown çıktısına gömmek için **Görüntüleri base64 olarak dahil et** seçeneğini açın.
3. İşlemeyi başlatmak için **Markdown'a Dönüştür** düğmesine tıklayın.
4. Tek bir dosya `filename.md` olarak iner. Birden fazla dosya bir `markdown-files.zip` üretir.

## Seçenekler

- **Görüntüleri base64 olarak dahil et**: işaretlendiğinde PDF'teki gömülü görseller çıkarılır ve Markdown çıktısında başvurulur. İşaretli değilse yalnızca metin içeriği dönüştürülür.

## Çıktı Biçimi

- **Tek dosya**: `filename.md`
- **Birden fazla dosya**: her girdi PDF'i için bir `.md` içeren `markdown-files.zip`.

## Kullanım Alanları

- PDF belgelerini VitePress, Hugo veya Jekyll gibi bir statik site oluşturucu için Markdown'a dönüştürmek.
- PDF araştırma makalelerini Obsidian gibi not alma uygulamaları için düzenlenebilir Markdown'a çevirmek.
- Eski PDF bilgi tabanlarını Git dostu bir metin biçimine taşımak.
- PDF e-kitaplardan yapılandırılmış içeriği yeniden biçimlendirmek üzere çıkarmak.

## İpuçları

- Include Images seçeneği, PDF içeriğin vazgeçilmez parçası olan diyagramlar veya şekiller içerdiğinde kullanışlıdır. Çıktıyı temiz tutmak için metin ağırlıklı belgelerde kapatın.
- Kenar çubukları, dipnotlar veya çok sütunlu metin içeren karmaşık düzenler kusurlu Markdown üretebilir. Çıktıyı gözden geçirip gerektiği gibi düzeltin.
- Hiçbir biçimlendirme olmadan ham metin için bunun yerine [PDF'den Metne](./pdf-to-text) aracını kullanın.

## İlgili Araçlar

- [PDF'den Metne](./pdf-to-text)
- [PDF'den Word'e](./pdf-to-word)
- [PDF'yi Yapay Zeka için Hazırla](./prepare-pdf-for-ai)
