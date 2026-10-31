---
title: PDF'yi Düzleştir
description: Etkileşimli formları ve ek açıklamaları statik içeriğe dönüştürün. Form alanlarını düzenlenemez yapar ve ek açıklamaları sayfaya işler.
---

# PDF'yi Düzleştir

Düzleştirme, etkileşimli öğeleri (form alanları, açılır listeler, onay kutuları, ek açıklamalar, vurgular, yapışkan notlar) doğrudan sayfa içeriğine birleştirir. Görünüm aynı kalır, ancak artık hiçbir şey düzenlenemez veya ayıklanamaz. Doldurulmuş bir formu yazdırıp yeniden taramanın PDF karşılığıdır, ancak kalite kusursuz kalır.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin.
2. **PDF'yi Düzleştir**'e tıklayın.
3. Tek bir dosya doğrudan iner. Birden fazla dosya ZIP arşivi oluşturur.

Araç, form alanlarını düzleştirmek için pdf-lib'i (`form.flatten()` ile) ve ek açıklamaları sayfa akışına işlemek için özel bir ek açıklama düzleştiriciyi kullanır. Her iki işlem de tek geçişte yapılır.

## Neler Düzleştirilir

- **Form alanları**: Metin girişleri, onay kutuları, radyo düğmeleri, açılır listeler, imza alanları
- **Ek açıklamalar**: Yorumlar, vurgular, üstü çizili, altı çizili, yapışkan notlar, damgalar, mürekkep ek açıklamaları
- **Etkileşimli öğeler**: Düğmeler, eylem tetikleyicileri

## Neler Değişmeden Kalır

- Metin içeriği (seçilebilir ve aranabilir kalır)
- Görseller ve grafikler
- Sayfa düzeni ve boyutları
- Yer imleri ve içindekiler tablosu
- Köprüler (ek açıklama tabanlı olmadıkça)

## Kullanım Alanları

- Doldurulmuş bir formu kilitleyerek alıcıların gönderilen yanıtları değiştirmesini önlemek
- Etkileşimli öğelerin gereksiz olduğu bir PDF'yi arşive hazırlamak
- Ek açıklamaların görüntüleyicilere göre farklı işlenmesinden kaynaklanan görüntü sorunlarını gidermek
- İmzalı bir belgenin imza uygulandıktan sonra değiştirilemediğinden emin olmak
- Form alanı tanımlarını ve ek açıklama nesnelerini ortadan kaldırarak dosya boyutunu küçültmek

## İpuçları

- Tüm düzenlemeler bittikten sonra düzleştirin. Bir PDF'nin düzleştirmesini geri almanın yolu yoktur.
- Düzleştirmenin yanı sıra meta verileri, JavaScript'i ve ekleri de temizlemeniz gerekiyorsa bunun yerine PDF'yi Temizle aracını kullanın; düzleştirme seçeneklerinden biri olarak orada da bulunur.
- Bazı PDF'ler "form bulunamadı" bildirir. Belgede yalnızca ek açıklamalar olup form alanı yoksa bu normaldir.

## İlgili Araçlar

- [PDF'yi Temizle](./sanitize-pdf): formları düzleştirin, ayrıca meta verileri, betikleri ve daha fazlasını kaldırın
- [PDF'yi Rasterleştir](./rasterize-pdf): azami düzleştirme için görsel tabanlı PDF'ye dönüştürün
- [Yazı Tipi Çerçeveye Dönüştür](./font-to-outline): yazı tiplerini vektör yollarına düzleştirin
- [PDF'yi Parolayla Koru](./protect-pdf): düzleştirilmiş PDF'yi parolayla kilitleyin
