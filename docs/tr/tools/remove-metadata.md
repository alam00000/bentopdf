---
title: Üst Veriyi Kaldır
description: Yazar, başlık, oluşturma tarihi, üretici, XMP verileri ve belge kimlikleri dahil PDF dosyalarındaki tüm gizli üst verileri temizleyin.
---

# Üst Veriyi Kaldır

Her PDF, kimin oluşturduğunu, hangi yazılımın kullanıldığını, en son ne zaman değiştirildiğini ve daha fazlasını ortaya çıkarabilecek üst veriler taşır. Bu araç bunların tamamını (bilgi sözlüğü, XMP üst veri akışları, belge kimlikleri ve uygulamaya özgü veriler) temizler ve geriye kaynağına dair hiçbir iz bırakmayan temiz bir belge bırakır.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. **Üst Veriyi Kaldır**'a tıklayın.
3. Temizlenmiş dosyayı indirin.

Yapılandırılacak seçenek yoktur. Araç tasarım gereği kapsamlıdır: her şeyi temizler.

## Neler Kaldırılır

- **Bilgi sözlüğü alanları**: Başlık, Yazar, Konu, Anahtar Sözcükler, Oluşturan, Üretici, oluşturma tarihi, değiştirme tarihi
- **XMP üst veri akışı**: Belge kataloğunda saklanan XML tabanlı üst veri bloğu
- **Belge kimlikleri**: PDF sonunda (trailer) bulunan ve bir belgeyi sistemler arasında izlemek için kullanılabilen benzersiz tanımlayıcılar
- **PieceInfo**: Illustrator veya InDesign gibi programların eklediği uygulamaya özgü üst veriler

## Neler Kalır

- Görünen tüm sayfa içeriği (metin, görseller, grafikler)
- Form alanları ve açıklamalar
- Yer işaretleri ve bağlantılar
- Belge yapısının kendisi

## Kullanım Alanları

- Bir belgeyi anonim olarak yayımlamadan önce adınızı ve kurumunuzu kaldırmak
- Belgenin ne zaman hazırlandığını ortaya çıkaran oluşturma zaman damgalarını temizlemek
- PDF yazılım yığınınızı tanımlayan üretici dizelerini temizlemek
- Üst verisiz PDF isteyen resmi başvurular için belgeleri hazırlamak
- Bir belgeyi dışarıyla paylaşmadan önce düzenleme geçmişi izlerini kaldırmak

## İpuçları

- Temizlemeden önce PDF'inizin tam olarak hangi üst verileri içerdiğini görmek için önce Üst Veriyi Görüntüle aracını kullanın.
- Üst verilerle birlikte JavaScript'i, açıklamaları ve gömülü dosyaları da kaldırmak istiyorsanız daha kapsamlı bir temizlik için PDF'yi Temizle aracını kullanın.
- Üst veri kaldırma kalıcıdır. Bu verilere daha sonra ihtiyacınız olabilirse özgün dosyanızı saklayın.

## İlgili Araçlar

- [PDF'yi Temizle](./sanitize-pdf): üst verilerle birlikte betikleri, ekleri ve daha fazlasını kaldırın
- [PDF'yi Parolayla Koru](./protect-pdf): temizlenmiş PDF'i parolayla koruyun
- [PDF Sıkıştır](./compress-pdf): üst verileri kaldırmak dosya boyutunu biraz küçültebilir, daha fazla tasarruf için sıkıştırın
