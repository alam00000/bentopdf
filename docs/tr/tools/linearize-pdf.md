---
title: PDF'yi Doğrusallaştır
description: PDF dosyalarını aşamalı yükleme ile hızlı web görüntüleme için optimize edin. "Hızlı Web Görünümü" optimizasyonu olarak da bilinir.
---

# PDF'yi Doğrusallaştır

Doğrusallaştırma, bir PDF'yi yeniden yapılandırarak ilk sayfanın tüm dosya inmeden görüntülenebilmesini sağlar. Adobe buna "Hızlı Web Görünümü" der. PDF'leri bir web sitesinde barındırıyor veya bir belge portalı üzerinden sunuyorsanız doğrusallaştırma, açılışlarını belirgin biçimde hızlandırır.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin.
2. **PDF'yi Doğrusallaştır**'a tıklayın.
3. Sonuçları, tüm doğrusallaştırılmış dosyaları içeren bir ZIP arşivi olarak indirin.

Yapılandırılacak ayar yoktur. Araç, QPDF'in `--linearize` bayrağını kullanır; bu bayrak PDF'nin görsel içeriğini değiştirmeden iç yapısını yeniden düzenler.

## Doğrusallaştırma Ne Yapar

- PDF nesnelerini, ilk sayfanın verisi dosyanın başında yer alacak şekilde yeniden sıralar
- Görüntüleyicilerin her sayfayı nerede bulacağını bilmesi için bir doğrusallaştırma sözlüğü ve ipucu tabloları ekler
- Bayt aralığı isteklerini etkinleştirir: tarayıcı tüm dosyayı indirmeden yalnızca ilk sayfayı alabilir
- Verimli rastgele erişim için çapraz başvuru tablosunu temizler

## Özellikler

- Tek işlemde birden fazla PDF'nin toplu işlenmesi
- Çıktı tüm içeriği, yazı tiplerini, görselleri ve etkileşimli öğeleri korur
- Güvenilir, standartlara uygun doğrusallaştırma için QPDF (WebAssembly) kullanır
- Kolay indirme için sonuçlar ZIP içinde paketlenir

## Kullanım Alanları

- Kullanıcıların anında sayfa görüntülemesini beklediği bir web sitesinde PDF raporları barındırmak
- PDF'leri tarayıcı içi görüntüleyicilerle web uygulamalarına gömmek
- Yavaş mobil bağlantılardan erişilen PDF kataloglarını veya kılavuzlarını yayımlamak
- Bayt aralığı sunumunu destekleyen içerik dağıtım ağları (CDN) için belgeleri hazırlamak

## İpuçları

- Diğer tüm düzenlemeler bittikten sonra doğrusallaştırın. Sonraki herhangi bir değişiklik (birleştirme, sayfa ekleme) doğrusallaştırmayı bozar.
- Mümkün olan en küçük ve en hızlı yüklenen PDF'ler için PDF Sıkıştır ile birleştirin.
- Doğrusallaştırma dosya boyutuna küçük bir ek yük getirir (genellikle %1'in altında).

## İlgili Araçlar

- [PDF Sıkıştır](./compress-pdf): doğrusallaştırmadan önce dosya boyutunu azaltın
- [PDF Onar](./repair-pdf): doğrusallaştırmayı engelleyen yapısal sorunları giderin
- [Meta Verileri Kaldır](./remove-metadata): çevrimiçi yayımlamadan önce meta verileri temizleyin
