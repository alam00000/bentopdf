---
title: İzinleri Değiştir
description: Yazdırma, kopyalama, düzenleme ve açıklama ekleme için PDF kullanım izinlerini ayarlayın veya değiştirin. 256 bit AES şifreleme kullanır.
---

# İzinleri Değiştir

PDF'nizle alıcıların neler yapabileceğini ince ayarlarla belirleyin. Dosyayı yalnızca bir parolayla kilitleyen temel şifrelemenin aksine bu araç, yazdırma, kopyalama, düzenleme, açıklama ekleme, form doldurma, belge birleştirme ve sayfa çıkarma işlemlerine tek tek izin vermenizi veya bunları engellemenizi sağlar. Hepsi 256 bit AES şifrelemeyle uygulanır.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. PDF zaten şifreliyse **Geçerli Parola**'yı girin.
3. Bir **Yeni Kullanıcı Parolası** (açmak için gerekir) ve/veya **Yeni Sahip Parolası** (izinleri denetler) belirleyin.
4. Onay kutularıyla tek tek izinleri açıp kapatın.
5. **İzinleri Değiştir**'e tıklayın.
6. Güncellenen PDF'yi indirin.

Her iki yeni parola alanını da boş bırakırsanız araç PDF'nin şifresini tamamen çözer ve tüm şifrelemeyi ve kısıtlamaları kaldırır.

## İzin Denetimleri

| İzin                             | Neyi Denetler                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Yazdırmaya İzin Ver**          | Belgenin yazdırılıp yazdırılamayacağı                                                       |
| **Kopyalamaya İzin Ver**         | Metin ve görsellerin seçilip kopyalanıp kopyalanamayacağı                                   |
| **Değiştirmeye İzin Ver**        | Belge içeriğinin düzenlenip düzenlenemeyeceği                                               |
| **Açıklama Eklemeye İzin Ver**   | Yorum, vurgu ve damga eklenip eklenemeyeceği                                                |
| **Form Doldurmaya İzin Ver**     | Etkileşimli form alanlarının doldurulup doldurulamayacağı                                   |
| **Belge Birleştirmeye İzin Ver** | Sayfaların eklenip eklenemeyeceği, silinip silinemeyeceği veya döndürülüp döndürülemeyeceği |
| **Sayfa Çıkarmaya İzin Ver**     | Tek tek sayfaların çıkarılıp çıkarılamayacağı                                               |

Tüm izinlerin uygulanması için bir sahip parolası gerekir. Sahip parolası olmadan izin bayrakları çoğu PDF okuyucusu tarafından yok sayılır.

## PDF'de İzinler Nasıl Çalışır

PDF izinleri şifreleme belirtiminin bir parçasıdır. Şifreleme sözlüğünde bit bayrakları olarak saklanır ve uyumlu PDF okuyucuları tarafından uygulanır. Temel fark şudur:

- **Kullanıcı parolası**: Dosyayı açmak için gereklidir.
- **Sahip parolası**: İzinleri değiştirmek veya kısıtlamaları kaldırmak için gereklidir. Bu parola olmadan izin bayrakları, kullanıcının hangi işlemleri yapabileceğini belirler.

Yalnızca bir sahip parolası belirlerseniz (kullanıcı parolası olmadan) herkes dosyayı açabilir ancak izin verilen işlemlerle sınırlıdır. İkisini de belirlerseniz dosyanın açılması için parola gerekir ve kimlik doğrulamadan sonra da kısıtlıdır.

## Kullanım Alanları

- Görüntülenip yazdırılabilen ancak düzenlenemeyen veya kopyalanamayan bir rapor dağıtmak
- Alıcıların doldurabildiği ama değiştiremediği bir sözleşme şablonu paylaşmak
- Görsellerin kopyalanmasının engellendiği bir PDF kataloğu yayımlamak
- Bir inceleme taslağında yapısal değişiklikleri engellerken açıklama eklemeye izin vermek

## İpuçları

- Etkili olması için her zaman bir sahip parolası belirleyin. Sahip parolası olmayan izinler uygulanamaz.
- Bazı üçüncü taraf PDF araçları izin bayraklarını yok sayar. Daha güçlü koruma için PDF'yi rasterleştirmeyi veya DRM kullanmayı düşünün.
- Eski RC4 ile şifrelenmiş PDF'leri AES-256'ya yükseltmek için bu aracı kullanın.

## İlgili Araçlar

- [PDF'yi Parolayla Koru](./protect-pdf): ayrıntılı izinler olmadan basit parola koruması
- [PDF Kilidini Aç](./unlock-pdf): şifrelemeyi tamamen kaldırın
- [Kısıtlamaları Kaldır](./remove-restrictions): sahip parolasına sahipseniz tüm kısıtlamaları kaldırın
