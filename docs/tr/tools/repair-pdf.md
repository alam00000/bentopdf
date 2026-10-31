---
title: PDF'yi Onar
description: QPDF'in onarım motoruyla bozuk veya hasarlı PDF dosyalarından veri kurtarın. Toplu işlemeyi destekler.
---

# PDF'yi Onar

Bir PDF açılmayı reddettiğinde, bozuk içerik gösterdiğinde veya görüntüleyicinizde hata verdiğinde bu araç iç yapısını yeniden oluşturmayı dener. Birçok bozulma türünden veri kurtarabilen QPDF'in onarım motorunu kullanır: bozuk çapraz başvuru tabloları, kesilmiş akışlar, geçersiz nesne başvuruları ve daha fazlası.

## Nasıl Çalışır

1. Hasarlı bir veya daha fazla PDF dosyası yükleyin.
2. **PDF'yi Onar**'a tıklayın.
3. Tek onarılmış dosya doğrudan iner. Birden fazla dosya bir ZIP arşivi oluşturur.

Araç her dosyayı QPDF'ten `--decrypt` bayrağıyla geçirir; bu, QPDF'in tüm PDF yapısını okuyup yeniden yazmasını sağlayarak kurtarılabilir sorunları düzeltir.

## Özellikler

- Tek işlemde birden fazla PDF'in toplu onarımı
- Kurtarılabilir ve kurtarılamaz dosyaların otomatik algılanması
- Birden fazla dosya işlenirken dosya başına başarı/başarısızlık raporu
- Denenmiş bir PDF dönüştürme kitaplığı olan QPDF'i (WebAssembly) kullanır

## Neleri Düzeltebilir

- Bozuk veya eksik çapraz başvuru tabloları
- Tamamlanmamış indirmelerden kalan kesilmiş dosya sonları
- Geçersiz nesne numaralandırması ve akış uzunlukları
- Hatalı PDF üreticilerinden kaynaklanan küçük yapısal tutarsızlıklar
- Başarısız şifre çözme girişimlerinden kalan şifreleme artıkları

## Neleri Düzeltemez

- İçerik verilerinin çoğunun eksik olduğu ağır biçimde kesilmiş dosyalar
- Sahip olmadığınız bir parolayla şifrelenmiş PDF'ler
- Aslında PDF olmayan dosyalar (yanlış dosya uzantısı)
- PDF içindeki görsel bozulması (yapı düzeltilir ancak piksel verisi yeniden üretilmez)

## Kullanım Alanları

- Başarısız bir e-posta indirmesinden bir PDF'i kurtarmak
- Eski veya standart dışı PDF üreticilerinin oluşturduğu dosyaları açmak
- Bir görüntüleyicide çalışıp diğerinde çalışmayan PDF'leri düzeltmek
- Hasarlı arşiv belgelerini uzun vadeli saklamaya hazırlamak

## İpuçları

- Onarım başarısız olursa dosyayı önce bir tarayıcıda açmayı deneyin. Tarayıcıların kendi kurtarma mantığı vardır ve yeniden kaydetmeye yetecek kadar içeriği işleyebilir.
- Onarımı başarısız olan şifreli PDF'ler için önce PDF'nin Şifresini Çöz aracını deneyin, ardından şifresi çözülmüş çıktıyı onarın.

## İlgili Araçlar

- [PDF Sıkıştır](./compress-pdf): onarılmış PDF'in yapısını daha da temizleyin
- [PDF'yi Doğrusallaştır](./linearize-pdf): onarılmış dosyayı web'de sunum için optimize edin
- [PDF'yi Düzleştir](./flatten-pdf): hasar görmüş olabilecek formları düzleştirin
