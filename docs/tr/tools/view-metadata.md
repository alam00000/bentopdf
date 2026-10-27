---
title: Üst Veriyi Görüntüle
description: Belge bilgileri, XMP verileri ve yapısal ayrıntılar dahil bir PDF'nin tüm meta veri özelliklerini inceleyin.
---

# Üst Veriyi Görüntüle

Bir PDF dosyasına gömülü gizli özellikleri inceleyin. Araç belge bilgilerini (başlık, yazar, tarihler), XMP meta verilerini, sayfa boyutlarını ve diğer yapısal verileri okunabilir bir biçimde gösterir.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. Araç dosyayı hemen ayrıştırır ve mevcut tüm meta verileri düzenli bölümler halinde gösterir.
3. Belge bilgisi sözlüğünü, XMP meta veri ağacını ve yapısal özellikleri inceleyin.
4. İşleme adımı gerekmez: meta veriler dosya yüklenir yüklenmez gösterilir.

## Özellikler

- Standart belge bilgisi alanlarını gösterir: Başlık, Yazar, Konu, Anahtar Sözcükler, Oluşturan, Üretici
- Oluşturma ve değiştirme tarihlerini okunabilir biçimde gösterir
- Tam XMP meta veri ağacını iç içe ad alanlarıyla ayrıştırır ve görüntüler
- PDF tarih biçimini (`D:20240101120000Z`) okunabilir tarihlere dönüştürür
- Kolay gezinme için katlanabilir bölümlere ayrılmıştır

## Meta Veri Bölümleri

| Bölüm                 | İçerik                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Belge Bilgisi**     | Başlık, Yazar, Konu, Anahtar Sözcükler, Oluşturan, Üretici, Oluşturma Tarihi, Değiştirme Tarihi |
| **XMP Meta Verileri** | Dublin Core, XAP, PDF ve özel ad alanlarını içeren, XML tabanlı tam meta veri ağacı             |
| **Belge Özellikleri** | Sayfa sayısı, PDF sürümü, dosya boyutu, şifreleme durumu                                        |

## Kullanım Alanları

- Bir PDF'yi kimin yazdığını ve en son ne zaman değiştirildiğini kontrol etmek
- Bir belge yayımlanmadan önce meta verilerin doğru ayarlandığını doğrulamak
- Hangi kişisel bilgilerin gömülü olduğunu kontrol ederek PDF'leri gizlilik açısından denetlemek
- Bir PDF'yi oluşturmak veya değiştirmek için kullanılan yazılımı incelemek (Üretici alanı aracılığıyla)
- Dijital varlık yönetimi uyumluluğu için XMP meta verilerini gözden geçirmek

## İpuçları

- `D:` ile başlayan PDF tarih dizeleri otomatik olarak yerel saat diliminize göre biçime dönüştürülür.
- Meta veri alanları boş görünüyorsa, PDF'yi oluşturan bunları ayarlamamıştır. Tüm PDF'ler zengin meta veri içermez.
- İnceledikten sonra meta verileri değiştirmek için [Meta Verileri Düzenle](./edit-metadata) aracını kullanın. Tamamen silmek için Meta Verileri Kaldır aracını kullanın.

## İlgili Araçlar

- [Meta Verileri Düzenle](./edit-metadata)
- [PDF Katmanları (OCG)](./pdf-layers)
- [PDF'leri Karşılaştır](./compare-pdfs)
