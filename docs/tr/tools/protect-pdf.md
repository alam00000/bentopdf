---
title: PDF'yi Şifrele
description: PDF dosyalarını 256 bit AES şifrelemesiyle parola ile koruyun. Yapılandırılabilir kullanım kısıtlamalarıyla kullanıcı ve sahip parolaları belirleyin.
---

# PDF'yi Şifrele

PDF'inizi bir parolanın arkasına kilitleyin, böylece yalnızca yetkili kişiler açabilir. BentoPDF, bankalar ve devlet kurumlarının kullandığı standartla aynı olan 256 bit AES şifrelemesini kullanır ve bunu tamamen tarayıcınızda QPDF aracılığıyla uygular.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. Bir **Kullanıcı Parolası** girin (zorunlu). Dosyayı açmak için gereken parola budur.
3. İsteğe bağlı olarak bir **Sahip Parolası** girin. Ayarlandığında PDF, yazdırmayı, düzenlemeyi, kopyalamayı ve not eklemeyi engelleyen kullanım kısıtlamaları kazanır.
4. **PDF'yi Şifrele**'ye tıklayın.
5. Şifrelenmiş dosyayı indirin.

## Parola Türleri

### Kullanıcı Parolası (Zorunlu)

Kullanıcı parolası, alıcıların PDF'i açmak için yazdığı paroladır. Bu parola olmadan belgeye hiçbir şekilde erişilemez. Her şifrelenmiş PDF'in bir kullanıcı parolası olmalıdır.

### Sahip Parolası (İsteğe Bağlı)

Sahip parolası, yetkili bir kullanıcının dosyayı açtıktan sonra neler yapabileceğini denetler. Farklı bir sahip parolası belirlediğinizde BentoPDF en sıkı kısıtlama kümesini otomatik olarak uygular:

- Değiştirme devre dışı
- Çıkarma/kopyalama devre dışı
- Yazdırma devre dışı
- Not ekleme devre dışı
- Form doldurma devre dışı
- Belge birleştirme devre dışı

Sahip parolasını boş bırakırsanız PDF yine şifrelenir (açmak için hâlâ kullanıcı parolası gerekir) ancak açıldıktan sonra kullanım kısıtlaması olmaz.

## Şifreleme Ayrıntıları

- **Algoritma**: AES-256 (256 bit Gelişmiş Şifreleme Standardı)
- **Anahtar uzunluğu**: 256 bit
- **Standart**: PDF 2.0 şifrelemesi (QPDF uygulaması)

AES-256'nın mevcut teknolojiyle kaba kuvvetle kırılması hesaplama açısından mümkün değildir. Şifrelenmiş PDF'inizin güvenliği tamamen parolanızın gücüne bağlıdır.

## Kullanım Alanları

- Gizli finansal raporları e-postayla göndermeden önce korumak
- Karşı tarafın avukatıyla paylaşılan hukuki belgeleri güvence altına almak
- Tıbbi kayıtlara veya kişisel olarak tanımlanabilir bilgilere parola eklemek
- Ücretli içerikleri (e-kitaplar, raporlar) erişim denetimiyle dağıtmak
- Bekleyen veriler için şifreleme gerektiren veri koruma politikalarına uymak

## İpuçları

- Güçlü ve benzersiz bir parola kullanın. Büyük/küçük harf, rakam ve sembol içeren 12+ karakterlik bir parola ibaresi idealdir.
- Parolayı ayrı bir kanaldan (telefon, kısa mesaj) paylaşın, asla PDF ile aynı e-postada göndermeyin.
- Açmak için parola gerektirmeden yalnızca işlemleri kısıtlamak istiyorsanız (yazdırma yok, kopyalama yok), bunun yerine İzinleri Değiştir aracını kullanın.

## İlgili Araçlar

- [PDF Kilidini Aç](./unlock-pdf): parolayı biliyorsanız şifrelemeyi kaldırın
- [İzinleri Değiştir](./change-permissions): belirli kullanım kısıtlamalarını değiştirin
- [Kısıtlamaları Kaldır](./remove-restrictions): bir PDF'teki tüm güvenlik önlemlerini kaldırın
- [PDF'yi Temizle](./sanitize-pdf): şifrelemeden önce gizli içeriği kaldırın
