---
title: Çift Taraflı Harmanla
description: Ön ve arka sayfaları ayrı bloklarda olan çift taraflı tarama PDF'lerini doğru ön/arka sayfa sırasına yeniden düzenleyin.
---

# Çift Taraflı Harmanla

Çift taraflı taramayı harmanla, bir PDF'nin iki sayfa bloğu içerdiği ADF tarama iş akışları için tasarlanmıştır:

- önce tüm ön yüzler
- sonra tüm arka yüzler

Elle bölüp yeniden birleştirmek yerine bu araç iki bloğu doğal okuma sırasında iç içe geçirir: ön1, arka1, ön2, arka2 ve devamı.

## Nasıl Çalışır

1. Çift taraflı deste taramasından oluşturulmuş tek bir PDF yükleyin.
2. Ön bloğun bittiği bölme noktasını ayarlayın.
3. Arka blok işleme biçimini seçin:
   - **Arka bloğu ters çevir** (arka yüzleri taramadan önce deste çevrildiğinde yaygındır)
   - **Arka bloğu olduğu gibi tut**
4. Yeniden sıralanmış sonucu indirmek için **PDF'yi Harmanla**'ya tıklayın.

## Seçenekler

- **Bölmeyi otomatik algıla (yarı)**: bölme noktasını `ceil(totalPages / 2)` olarak ayarlar.
- **Tek sayfa uyarısı**: toplam sayfa sayısı tek olduğunda uyarır (genellikle tarama uyumsuzluğudur).
- **Eşitsiz blok onayı**: ön/arka blok boyutları farklı olduğunda onay ister.
- **Gruplanmış dışa aktarım**: harmanlanmış çıktıyı özgün belge sayfa sayısına göre ayrı PDF'lere böler ve ZIP olarak indirir.

## Çıktı Davranışı

- **Varsayılan**: tek bir çıktı PDF'si (tek girdi PDF'si, tek çıktı PDF'si).
- **Gruplanmış mod**: çıktı, belge başına sayfa değerinize göre parçalara bölünür; birden çok parça üretilirse tek bir ZIP olarak, aksi hâlde tek bir PDF olarak indirilir.

Blok boyutları eşit değilse eşleşen sayfalar önce harmanlanır, eşleşmeyen kalan sayfalar en sona eklenir.

## Yaygın Kullanım Alanları

- Bir yığın çift taraflı formu iki geçişte taradıktan sonra sırayı geri yüklemek.
- Önce tüm ön yüzleri, sonra tüm arka yüzleri veren ofis tarayıcılarından ön/arka paketleri yeniden oluşturmak.
- Belge başına dosyalara bölmeden önce arşiv taramalarını son işlemeden geçirmek.

## İpuçları

- Çoğu çift taraflı toplu işin toplam sayfa sayısı çift olmalıdır.
- Arka yüzler ters görünüyorsa **Arka bloğu ters çevir** ile **Arka bloğu olduğu gibi tut** arasında geçiş yapın.
- 2 sayfalık özgün belgeler (ön+arka) için belge başına `2` sayfa ile gruplanmış dışa aktarımı kullanın.

## İlgili Araçlar

- [Sayfaları Karıştır & Birleştir](./alternate-merge)
- [PDF Böl](./split-pdf)
- [PDF Birleştir](./merge-pdf)
- [Çoğalt & Düzenle](./organize-pdf)
