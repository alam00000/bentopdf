---
title: İmzayı Doğrula
description: PDF dosyalarındaki dijital imzaları doğrulayın. Sertifika geçerliliğini, imzalayan kimliğini, belge bütünlüğünü ve güven zinciri durumunu kontrol edin.
---

# İmzayı Doğrula

İmzalı bir PDF yükleyin; bu araç her dijital imzayı çıkarır, imzalayanı belirler, sertifika geçerliliğini kontrol eder ve belgenin imzalandıktan sonra değiştirilip değiştirilmediğini bildirir. İmza zincirini doğrulamak için güvenilir bir sertifika da sağlayabilirsiniz.

## Nasıl Çalışır

1. İmzalı bir PDF dosyası yükleyin. Doğrulama otomatik olarak başlar.
2. Araç bir özet gösterir: bulunan imza sayısı ve kaçının geçerli olduğu.
3. Her imza için imzalayan adı, düzenleyen, tarihler ve durumu gösteren ayrıntılı bir kart görüntülenir.
4. İsteğe bağlı olarak, imzayı belirli bir güven çapasına karşı doğrulamak için bir **güvenilir sertifika** (.pem, .crt, .cer, .der) yükleyin. Yeniden doğrulama otomatik olarak çalışır.

## Neler Kontrol Edilir

### İmza Ayrıştırma

Araç, PDF'den PKCS#7 imza nesnelerini çıkarır, ASN.1 yapısını çözer ve imzalayanın X.509 sertifikasını, imzaya gömülü sertifika zinciriyle birlikte alır.

### Sertifika Geçerliliği

- **Son kullanma tarihi**: Sertifika şu anda geçerlilik tarih aralığında mı?
- **Kendinden imzalı algılama**: Sertifika kendi düzenleyicisi mi?
- **Güven zinciri**: Güvenilir bir sertifika sağlandığında, imzalayanın sertifikası ona kadar uzanan bir zincire sahip mi?

### Kriptografik Doğrulama

- Araç, imzanın `/ByteRange` değerinin kapsadığı baytları yeniden oluşturur, imzalayanın belirttiği algoritmayla özetini çıkarır ve sonucu imza içindeki `messageDigest` özniteliğiyle karşılaştırır.
- Ardından imzalı öznitelikleri DER SET olarak yeniden serileştirir ve imzayı, imzalayan sertifikanın açık anahtarına karşı doğrular.
- **Bir imza yalnızca bunların hepsi geçtiğinde geçerli olarak bildirilir.** PDF baytları imzalandıktan sonra değiştirildiyse veya gömülü imza imzalayanın anahtarıyla eşleşmiyorsa, durum belirli nedenle birlikte "Geçersiz: Kriptografik Doğrulama Başarısız" olarak görünür.

#### Desteklenen İmza Algoritmaları

| Algoritma               | Doğrulama yolu                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, Web Crypto yedeğiyle                                 |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                  |
| ECDSA P-256/P-384/P-521 | DER → IEEE P1363 imza dönüşümünden sonra Web Crypto `verify({name: 'ECDSA', hash})` |

Bir imza bu listenin dışında bir algoritma kullanıyorsa (örneğin Ed25519, SM2 veya alışılmadık bir özet OID'sine sahip RSA), kart sarı renkte **"Doğrulanmadı: Desteklenmeyen İmza Algoritması"** ifadesini ve belirli OID'yi veya nedeni gösterir. Bu kasıtlı bir üç durumlu ayrımdır:

- **Geçerli**: imza, imzalayanın açık anahtarına karşı kriptografik olarak doğrulandı.
- **Geçersiz**: doğrulama çalıştı ve olumsuz sonuç verdi (baytlar değişti, anahtar uyuşmuyor).
- **Doğrulanmadı**: araç bu algoritma için doğrulamayı çalıştıramadı. Sertifika meta verileri yine gösterilir, ancak imzayı "bilinmiyor" olarak değerlendirmeli ve Adobe Acrobat veya `openssl cms -verify` ile doğrulamalısınız.

### Güvensiz Özet Algoritmaları

- **MD5 veya SHA-1** kullanan imzalar geçersiz olarak reddedilir ve "Güvensiz Özet" durumuyla işaretlenir. Her iki algoritmanın da yayımlanmış çakışma saldırıları vardır, bu nedenle SHA-1 veya MD5 özeti üzerindeki bir imza bütünlük garantisi vermez.
- SHA-224, SHA-256, SHA-384 ve SHA-512 kabul edilir.

### Belge Kapsamı

- **Tam kapsam**: İmza PDF dosyasının tamamını kapsar, yani imzalandıktan sonra hiçbir bayt eklenmemiş veya değiştirilmemiştir.
- **Kısmi kapsam**: İmza dosyanın yalnızca bir bölümünü kapsar. Bu, imzalandıktan sonra değişiklik yapıldığını gösterebilir (zararlı olması gerekmez, artımlı kayıtlar kısmi kapsam üretir).

## İmza Ayrıntıları

Her imza kartında şunlar gösterilir:

- **İmzalayan**: İmzalayanın sertifikasındaki ortak ad, kuruluş ve e-posta
- **Düzenleyen**: İmzalayanın sertifikasını veren Sertifika Yetkilisi
- **İmza Tarihi**: İmzaya gömülü zaman damgası
- **Geçerlilik Başlangıcı / Bitişi**: Sertifikanın geçerlilik süresi
- **Neden**: Belgenin neden imzalandığı (belirtilmişse)
- **Konum**: Nerede imzalandığı (belirtilmişse)
- **Kapsam Durumu**: Tam veya Kısmi
- **Güven Rozeti**: Güvenilir veya Güven zincirinde değil (yalnızca özel bir sertifika sağlandığında)

### Teknik Ayrıntılar

Şunlar için teknik ayrıntılar bölümünü genişletin:

- İmzalayanın sertifikasının seri numarası
- Özet algoritması (SHA-256, SHA-512 vb.)
- İmza algoritması (SHA-256 ile RSA, SHA-256 ile ECDSA vb.)
- Geçersiz imzalar için hata iletileri

## Kullanım Alanları

- Karşı imza atmadan önce dijital olarak imzalanmış bir sözleşmeyi doğrulamak
- İmzalı belgelerin üzerinde oynanmadığını doğrulamak için denetlemek
- Bir sertifikanın belge imzalandıktan sonra süresinin dolup dolmadığını kontrol etmek
- İmzaları kurumunuzun kök sertifikasına karşı doğrulamak
- Resmi veya hukuki belgelerin imza ayrıntılarını incelemek

## İpuçları

- Kendinden imzalı bir sertifika imzanın geçersiz olduğu anlamına gelmez, imzalayanın kimliğinin güvenilir bir üçüncü taraf aracılığıyla doğrulanamadığı anlamına gelir. Bu, iç belgelerde yaygındır.
- Kısmi kapsam her zaman kurcalama anlamına gelmez. Birçok PDF iş akışı (ikinci bir imza gibi) kısmi kapsam oluşturan artımlı güncellemeler ekler.
- Güven zinciri doğrulaması almak için kurumunuzun kök veya ara sertifikasını güvenilir sertifika olarak yükleyin.

## İlgili Araçlar

- [Dijital İmza](./digital-sign-pdf): PDF'leri kendi sertifikanızla imzalayın
- [PDF'yi Düzleştir](./flatten-pdf): imza sonrası değişiklikleri önlemek için imzalamadan önce PDF'yi düzleştirin
- [Meta Verileri Kaldır](./remove-metadata): imza uygulamadan önce bir PDF'yi temizleyin
