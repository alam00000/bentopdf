---
title: Dijital İmza
description: X.509 sertifikalarıyla PDF'lere kriptografik dijital imzalar ekleyin. Görünür imza seçenekleriyle PKCS#12 ve PEM biçimlerini destekler.
---

# Dijital İmza

Dijital imza, belgeyi belirli bir kişinin imzaladığının ve belgenin o zamandan beri değiştirilmediğinin kriptografik kanıtıdır. Yalnızca bir görsel olan çizilmiş imzanın aksine dijital imza, doğrulanabilir özgünlük ve bütünlük sağlamak için X.509 sertifikalarını ve PKCS#7 standartlarını kullanır.

BentoPDF dijital imzaları tamamen tarayıcınızda uygular. Özel anahtarınız cihazınızdan asla çıkmaz.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. Sertifika dosyanızı yükleyin (.pfx, .p12 veya .pem).
3. Kilidini açmak için sertifika parolasını girin. Araç sertifikanın konusunu, vereni ve geçerlilik süresini gösterir.
4. İsterseniz imza üst verilerini (neden, konum, iletişim bilgisi) yapılandırın.
5. İsterseniz konum, boyut, görsel ve metin özelleştirmesiyle **görünür imzayı** etkinleştirin.
6. **PDF'yi İmzala**'ya tıklayın.

## Desteklenen Sertifika Biçimleri

| Biçim       | Uzantılar  | Açıklama                                                                                                               |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| **PKCS#12** | .pfx, .p12 | Özel anahtarı ve sertifika zincirini içeren sektör standardı paket. En yaygın biçim.                                   |
| **PEM**     | .pem       | Metin tabanlı biçim. Hem sertifikayı hem de özel anahtarı tek dosyada içermelidir. Şifreli özel anahtarları destekler. |

## Görünür İmza Seçenekleri

Etkinleştirildiğinde PDF sayfasında görünür bir imza bloğu işlenir:

- **Konum**: X/Y koordinatları ile genişlik/yükseklik, punto olarak
- **Sayfa**: İlk sayfa, son sayfa, tüm sayfalar veya belirli bir sayfa numarası
- **Görsel**: Bir PNG, JPG veya WebP görseli yükleyin (el yazısı imzanız, şirket mührü vb.)
- **Metin**: Rengi ve yazı boyutu ayarlanabilen özel metin. Görsel veya metin verilmezse araç, sertifikanın ortak adından ve geçerli tarihten otomatik metin üretir.

## İmza Üst Verileri

- **Neden**: Belgenin neden imzalandığı (örn. "Onaylandı", "İncelendi")
- **Konum**: İmzalamanın nerede yapıldığı (örn. "New York, NY")
- **İletişim Bilgisi**: İmzalayana nasıl ulaşılacağı (örn. e-posta adresi)

## İnternet Bağlantısı Notu

İmzalama için internet bağlantısı gerekebilir. İmzalama kitaplığı, sertifika zincirini sertifikanızın Authority Information Access (AIA) uzantısında gömülü URL'lerden alır. Bu sunuculara ulaşılamazsa zincir doğrulaması gerektiren sertifikalar için imzalama başarısız olur.

## Kullanım Alanları

- Sözleşmeleri, teklifleri ve anlaşmaları yasal bağlayıcılığı olan dijital imzalarla imzalamak
- PKI tabanlı kimlik doğrulama gerektiren iş akışlarında resmi belgeleri onaylamak
- Mevzuata uyum için PDF faturaları imzalamak (birçok AB ülkesi dijital imzalı e-fatura şart koşar)
- Mühendislik çizimlerine veya kalite belgelerine kurumsal onay eklemek

## İpuçları

- Kendinden imzalı sertifikalar test için çalışır ancak Adobe Reader'da uyarı gösterir. Üretim belgeleri için güvenilir bir Sertifika Yetkilisinden alınmış sertifika kullanın.
- Görünür imza yalnızca görseldir. Kriptografik imza, görünür blok etkin olsun veya olmasın gömülür.
- İmzanın bozulmadığını doğrulamak için imzalı PDF'nizi İmza Doğrula aracıyla kontrol edin.

## İlgili Araçlar

- [İmza Doğrula](./validate-signature-pdf): imzalı PDF'lerdeki dijital imzaları doğrulayın
- [PDF'yi Düzleştir](./flatten-pdf): değişiklikleri önlemek için imzalamadan önce formları düzleştirin
- [PDF'yi Parolayla Koru](./protect-pdf): dijital imzanın üzerine parola koruması ekleyin
- [Üst Veriyi Kaldır](./remove-metadata): imzalamadan önce üst verileri temizleyin
