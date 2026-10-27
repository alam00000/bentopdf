---
title: Kısıtlamaları Kaldır
description: PDF dosyalarından parola korumasını, yazdırma kısıtlamalarını, düzenleme kilitlerini ve kopyalama sınırlarını kaldırın.
---

# Kısıtlamaları Kaldır

PDF'ler iki tür parola taşıyabilir: kullanıcı parolası (dosyayı açmak için gerekir) ve sahip parolası (dosyayla neler yapabileceğinizi denetler). Bu araç her ikisini ve bunlarla ilişkili tüm kısıtlamaları (yazdırma, düzenleme, kopyalama ve not ekleme kilitleri) kaldırır.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. PDF'in sahip parolası varsa bunu **Sahip Parolası** alanına girin. PDF'te parola olmadan yalnızca kullanım kısıtlamaları varsa boş bırakın.
3. **Kısıtlamaları Kaldır**'a tıklayın.
4. Kısıtlamasız PDF'i indirin.

Araç, temiz ve kısıtlamasız bir kopya üretmek için QPDF'in `--decrypt` ve `--remove-restrictions` bayraklarını kullanır.

## Neler Kaldırılır

- Parola koruması (hem kullanıcı hem sahip parolaları)
- Yazdırma kısıtlamaları
- Düzenleme kısıtlamaları
- Metin ve görsel kopyalama kısıtlamaları
- Not ekleme ve yorum yapma kısıtlamaları
- PDF'e kodlanmış diğer tüm güvenlik sınırlamaları

## Kullanım Alanları

- Sahibi olduğunuz ancak parolasını yıllar önce belirlediğiniz bir PDF'in kilidini açmak
- Meşru erişiminiz olan bir belgeden yazdırma kısıtlamalarını kaldırmak
- Not almak için referans materyallerinde kopyala-yapıştırmayı etkinleştirmek
- PDF'leri, kısıtlı belgeleri işleyemeyen erişilebilirlik araçları için hazırlamak

## İpuçları

- Bir sahip parolası ayarlanmışsa bunu bilmeniz gerekir. Bu araç parolaları kırmaz veya kaba kuvvetle denemez.
- Dosyayı şifreli tutup yalnızca belirli izinleri değiştirmek istiyorsanız bunun yerine İzinleri Değiştir aracını kullanın.
- Çıktı dosyasında hiç şifreleme yoktur, yani onu alan herkes serbestçe açabilir.

## İlgili Araçlar

- [PDF Kilidini Aç](./unlock-pdf): kullanıcı parolasını biliyorsanız bir PDF'in kilidini açın
- [PDF'yi Parolayla Koru](./protect-pdf): şifrelemeyi yeni ayarlarla yeniden uygulayın
- [İzinleri Değiştir](./change-permissions): hangi işlemlere izin verileceğini seçerek değiştirin
