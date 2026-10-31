---
title: Sayfa Etiketleri Ekle
description: Roma rakamları, harf önekleri, özel numaralandırma ve belge başına birden fazla kural ile PDF sayfa etiketleri ekleyin.
---

# Sayfa Etiketleri Ekle

Sayfa etiketleri, sayfa numaralarının PDF görüntüleyicilerde nasıl gösterileceğini belirler (araç çubuğunda görünen numara, sayfaya basılan numara değildir). Bu araçla farklı sayfa aralıklarına farklı etiketleme düzenleri atayabilirsiniz: ön bölüm için Roma rakamları, ana metin için ondalık sayılar, harfli ekler ve daha fazlası.

## Nasıl Çalışır

1. PDF dosyanızı yükleyin.
2. Seçenekler paneli varsayılan olarak bir etiket kuralıyla açılır.
3. Her kuralı bir sayfa aralığı, stil, isteğe bağlı önek ve başlangıç değeriyle yapılandırın.
4. Farklı bölümler için ek kurallar oluşturmak üzere **Kural Ekle**'ye tıklayın.
5. Tüm kuralları uygulamak ve sonucu indirmek için **Sayfa Etiketleri Ekle**'ye tıklayın.

## Seçenekler

Her etiket kuralının şu ayarları vardır:

- **Sayfa Aralığı** -- Kuralın hangi sayfalara uygulanacağı. Tüm sayfalar için boş bırakın. `1-4`, `7`, `odd` veya `1-9,30-40` gibi aralıkları destekler.
- **Etiket Stili** -- Ondalık Arap rakamı, küçük harfli Roma rakamı (i, ii, iii), büyük harfli Roma rakamı (I, II, III), küçük harf (a, b, c), büyük harf (A, B, C) veya Etiketsiz (yalnızca önek).
- **Etiket Öneki** -- Her etiketin başına eklenen isteğe bağlı metin; örneğin "A-" ile A-1, A-2, A-3 gibi etiketler oluşturulur.
- **Başlangıç Değeri** -- Saymaya başlanacak sayı. Varsayılan 1'dir. Sıfırdan başlayan numaralandırma için 0 yapın.
- **Ayrık aralıklarda numaralandırmaya devam et** -- Bir kural bitişik olmayan sayfaları hedeflediğinde (`1-9,30-40` veya `odd` gibi) ve numaralandırmanın sırayla devam etmesini istediğinizde bunu etkinleştirin.
- **Mevcut sayfa etiketlerini kaldır** -- Varsayılan olarak işaretlidir. Yeni kurallarınızı uygulamadan önce önceki etiketleri temizler.

## Özellikler

- Karmaşık numaralandırma düzenleri için belge başına birden fazla etiket kuralı
- Tüm standart numaralandırma sistemlerini kapsayan altı etiket stili
- Bölüm bazlı etiketleme için özel önek desteği
- Aşamalı numaralandırmayla ayrık aralık desteği
- Mevcut etiketleri koruma veya kaldırma seçeneği

## Kullanım Alanları

- Bir kitabın önsözü için Roma rakamı (i, ii, iii), ana metin için ondalık etiketler ayarlamak
- Ek sayfalarını "A-1", "A-2", "B-1", "B-2" gibi harf önekleriyle etiketlemek
- Fiziksel sayfa numaralarının PDF sayfa sırasıyla eşleşmediği taranmış bir belgedeki sayfa etiketlerini düzeltmek
- Teknik belgeler için sıfırdan başlayan numaralandırma eklemek

## İpuçları

- Sayfa etiketleri, PDF görüntüleyicilerin gezinme araç çubuğunda gösterdiği üst verilerdir. Sayfaya basılmazlar. Görünür numaralar için [Sayfa Numaraları](./page-numbers) aracını kullanın.
- Bu araç, WASM Ayarlarınızda CoherentPDF (CPDF) yapılandırılmış olmasını gerektirir. Kurulu değilse yapılandırmanız istenir.

## İlgili Araçlar

- [Sayfa Numaraları](./page-numbers)
- [Bates Numaralandırma](./bates-numbering)
- [Yer İşaretlerini Düzenle](./bookmark)
