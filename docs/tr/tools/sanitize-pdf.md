---
title: PDF'yi Temizle
description: Üst veriler, JavaScript, gömülü dosyalar, açıklamalar ve katmanlar dahil PDF'lerdeki gizli ve potansiyel olarak tehlikeli içeriği kaldırın.
---

# PDF'yi Temizle

PDF'ler ekranda gördüğünüzden çok daha fazlasını taşıyabilir. Gizli üst veriler, gömülü JavaScript, dosya ekleri, form verileri ve katman bilgileri hassas verileri sızdırabilir veya güvenlik riski oluşturabilir. Temizleme bunların tamamını kaldırarak size herkese açık paylaşımda güvenli, temiz bir belge bırakır.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. Onay listesinden hangi öğelerin kaldırılacağını seçin.
3. **PDF'yi Temizle**'ye tıklayın.
4. Temizlenmiş dosyayı indirin.

## Temizleme Seçenekleri

Tüm seçenekler varsayılan olarak etkindir. Korumak istediklerinizin işaretini kaldırın.

| Seçenek                     | Neyi Kaldırır                                                               |
| --------------------------- | --------------------------------------------------------------------------- |
| **Formları Düzleştir**      | Etkileşimli form alanlarını statik içeriğe dönüştürür                       |
| **Üst Veriyi Kaldır**       | Yazar, başlık, oluşturma tarihi, yazılım bilgisi ve XMP verilerini temizler |
| **Açıklamaları Kaldır**     | Yorumları, vurguları, yapışkan notları ve işaretlemeleri siler              |
| **JavaScript'i Kaldır**     | Açılışta çalışabilecek gömülü betikleri ortadan kaldırır                    |
| **Gömülü Dosyaları Kaldır** | PDF'e gömülü dosya eklerini temizler                                        |
| **Katmanları Kaldır (OCG)** | İsteğe bağlı içerik gruplarını tek bir katmanda düzleştirir                 |
| **Bağlantıları Kaldır**     | Köprüleri ve URL başvurularını temizler                                     |
| **Yapı Ağacını Kaldır**     | Erişilebilirlik etiketleme için kullanılan belge yapısını kaldırır          |
| **MarkInfo'yu Kaldır**      | İşaretli içerik bilgilerini temizler                                        |
| **Yazı Tiplerini Kaldır**   | Gömülü yazı tipi verilerini kaldırır (dikkatli kullanın)                    |

## Kullanım Alanları

- Dahili üst verileri (yazar adları, yazılım sürümleri, düzenleme geçmişi) temizleyerek bir PDF'i herkese açık yayına hazırlamak
- Güvenilmeyen bir kaynaktan gelen PDF'i açmadan önce JavaScript'ini kaldırmak
- Gömülü yorumları veya form alanı adlarını görmemesi gereken bir müşteriye göndermeden önce PDF'i temizlemek
- Nihai sürümü paylaşmadan önce bir mimari çizimden gizli katmanları temizlemek
- Gizlilik düzenlemeleri kapsamındaki veri en aza indirme gereksinimlerine uymak

## İpuçları

- PDF'in yine de doğru işleneceğinden emin değilseniz "Yazı Tiplerini Kaldır" seçeneğini işaretlemeyin. Yazı tiplerini kaldırmak bazı görüntüleyicilerde metni görünmez yapabilir.
- Yalnızca üst verileri temizlemeniz gerekiyorsa, özel Üst Veriyi Kaldır aracı daha hızlı ve daha odaklıdır.
- Temizleme geri alınamaz. Özgün dosyanızı saklayın.

## İlgili Araçlar

- [Üst Veriyi Kaldır](./remove-metadata): diğer içeriğe dokunmadan yalnızca üst verileri temizleyin
- [PDF'yi Düzleştir](./flatten-pdf): özellikle formları ve açıklamaları düzleştirin
- [PDF'yi Parolayla Koru](./protect-pdf): temizledikten sonra parola koruması ekleyin
- [PDF'yi Rasterleştir](./rasterize-pdf): son çare: tüm gizli içeriği ortadan kaldırmak için görsellere dönüştürün
