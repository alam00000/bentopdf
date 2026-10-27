---
title: Yazı Tipini Ana Hatlara Dönüştür
description: Cihazlar arasında tutarlı görüntüleme için tüm PDF yazı tiplerini vektör çerçevelerine dönüştürün. Yazı tipi bağımlılığı sorunlarını ortadan kaldırır.
---

# Yazı Tipini Ana Hatlara Dönüştür

Yazı tiplerini çerçeveye dönüştürmek, her metin karakterini yazı tipi tabanlı bir glifden vektör yoluna çevirir. PDF artık yüklü hiçbir yazı tipine bağlı değildir: her cihazda, her işletim sisteminde ve her yazıcıda aynı görünür. Bu, baskı öncesi iş akışlarında standart bir adımdır.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin.
2. **Çerçevelere Dönüştür**'e tıklayın.
3. Ghostscript tüm metni vektör yollarına dönüştürür.
4. Sonucu indirin. Birden fazla dosya ZIP arşivi oluşturur.

Yapılandırılacak bir ayar yoktur. Araç, tüm yazı tipi başvurularını tek geçişte çerçeveli yollara dönüştürmek için Ghostscript'i (WebAssembly) kullanır.

## Neler Değişir

- Metin karakterleri vektör eğrilerine (bezier yolları) dönüşür
- Yazı tipi gömmeye artık gerek kalmaz; PDF glif düzeyinde kendi kendine yeterlidir
- Vektör yolları genellikle yazı tipi başvurularından büyük olduğundan dosya boyutu artabilir
- Görsel görünüm birebir korunur

## Neleri Kaybedersiniz

- Metin seçme ve kopyala-yapıştır
- Metin aranabilirliği (Ctrl+F çalışmaz)
- Metin içeriğini düzenleme imkanı
- Ekran okuyucu erişilebilirliği

## Kullanım Alanları

- Çerçeveli yazı tipi isteyen bir matbaaya PDF göndermek
- Özel veya lisanslı yazı tipleri kullanan belgeleri bu yazı tiplerine sahip olmayan kişilerle paylaşmak
- Belgenizin diğer sistemlerde görünümünü değiştiren yazı tipi ikamesini önlemek
- Vektör girdi gerektiren lazer gravür veya CNC kesim iş akışları için PDF hazırlamak
- Logo ağırlıklı bir PDF'nin tüm platformlarda doğru görüntülenmesini sağlamak

## İpuçları

- Özgün PDF'nizi saklayın. Çerçeveye dönüştürme geri alınamaz; yolları tekrar düzenlenebilir metne çeviremezsiniz.
- Metnin aranabilir kalması gerekiyorsa, bunun yerine PDF'yi Rasterleştir aracını ve ardından OCR'ı değerlendirin.
- Çerçeveli PDF'ler daha büyük olma eğilimindedir. Dosya boyutu önemliyse sonrasında PDF Sıkıştır'ı çalıştırın.

## İlgili Araçlar

- [PDF'yi Düzleştir](./flatten-pdf): yazı tiplerine dokunmadan formları ve ek açıklamaları düzleştirin
- [PDF'yi Rasterleştir](./rasterize-pdf): vektör çerçeveler yerine görsel tabanlı PDF'ye dönüştürün
- [PDF Sıkıştır](./compress-pdf): çerçeveye dönüştürmeden sonra dosya boyutunu azaltın
- [PDF'den PDF/A'ya](./pdf-to-pdfa): yazı tipi bağımsızlığını sağladıktan sonra arşiv için dönüştürün
