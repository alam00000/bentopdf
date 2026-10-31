---
title: PDF'den PDF/A'ya
description: Standart PDF'leri uzun süreli arşivleme için PDF/A biçimine dönüştürün. PDF/A-1b, PDF/A-2b ve PDF/A-3b uyumluluk düzeylerini destekler.
---

# PDF'den PDF/A'ya

PDF/A, uzun süreli dijital koruma için tasarlanmış, ISO standardı bir PDF alt kümesidir. Bu araç, doğrudan tarayıcınızda çalışan Ghostscript kullanarak standart PDF'lerinizi PDF/A uyumlu belgelere dönüştürür.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin.
2. Açılır listeden bir **PDF/A Sürümü** seçin.
3. İsteğe bağlı olarak, normal dönüştürmenin başarısız olduğu karmaşık dosyalar için **PDF'yi ön düzleştir** seçeneğini etkinleştirin.
4. **PDF/A'ya Dönüştür** düğmesine tıklayın. Birden fazla dosya bir ZIP arşivi üretir.

## PDF/A Sürümleri

| Sürüm        | Kısıtlamalar                          | En Uygun Olduğu Durum                         |
| ------------ | ------------------------------------- | --------------------------------------------- |
| **PDF/A-1b** | En katı. Saydamlık yok, katman yok.   | Eski arşiv sistemleriyle azami uyumluluk      |
| **PDF/A-2b** | Saydamlığa ve JPEG2000'e izin verir.  | Genel amaçlı arşivleme (önerilir)             |
| **PDF/A-3b** | Her biçimde gömülü eklere izin verir. | Kaynak veri dosyalarıyla belgeleri arşivlemek |

PDF/A-2b varsayılan olarak seçilidir ve arşivleme ihtiyaçlarının büyük çoğunluğu için uygundur.

## Pre-flatten Seçeneği

Bazı PDF'ler, temiz bir PDF/A dönüştürmesini engelleyen özellikler içerir: alışılmadık yazı tipi kodlamaları, karmaşık saydamlık yığınları veya bozuk iç yapılar. **PDF'yi ön düzleştir** seçeneğini etkinleştirmek, dönüştürmeden önce PDF'i 300 DPI'da rasterleştirir; bu, uyumluluğu garanti eder ancak metni seçilemez hale getirir. Standart dönüştürme hata verdiğinde yedek olarak kullanın.

Pre-flatten, PyMuPDF WASM motorunu gerektirir.

## Kullanım Alanları

- Resmi veya hukuki arşiv gereksinimlerini karşılamak (birçok yargı bölgesi mahkeme dosyaları için PDF/A zorunlu kılar)
- Belgeleri kurumsal depolara veya dijital kütüphanelere göndermek
- Orijinal yazılımın on yıl sonra var olmayabileceği ticari kayıtları korumak
- Faturaları, XML ekleriyle PDF/A-3b gerektiren e-fatura standartlarına hazırlamak

## İpuçları

- Önce pre-flatten olmadan dönüştürmeyi deneyin. Yalnızca hata alırsanız etkinleştirin.
- PDF/A tüm yazı tiplerini gömer, bu nedenle çıktı dosyaları genellikle özgün dosyalardan büyüktür.
- İş akışınız için katı uyumluluk gerekiyorsa çıktıyı özel bir PDF/A doğrulayıcıda doğrulayın.

## İlgili Araçlar

- [PDF Sıkıştır](./compress-pdf): dönüştürmeden sonra dosya boyutunu küçültün
- [PDF'yi Düzleştir](./flatten-pdf): PDF/A'ya dönüştürmeden önce formları düzleştirin
- [Üst Veriyi Kaldır](./remove-metadata): arşivlemeden önce üst veriyi temizleyin
