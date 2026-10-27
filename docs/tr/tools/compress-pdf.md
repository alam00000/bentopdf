---
title: PDF Sıkıştır
description: Hyper Compress motoruyla PDF dosya boyutunu %90'a kadar küçültün. Hedef dosya boyutlarını, toplu işlemeyi ve özel kalite ayarlarını destekler.
---

# PDF Sıkıştır

PDF dosyalarınızı bozmadan küçültün. PDF Sıkıştır, BentoPDF'in kendi sıkıştırma motoru olan [Hyper Compress](https://www.bentopdf.com/hyper-compress) ile çalışır. Görselleri yeniden sıkıştırır, yazı tiplerini alt kümeleyip birleştirir ve gömülü küçük resimler ile özel uygulama verileri gibi gereksiz yükü temizler. PDF tamamen işlevsel kalır: metin seçilebilir olmaya devam eder, bağlantılar ve form alanları çalışmayı sürdürür.

Hyper Compress WebAssembly'ye derlenir ve BentoPDF ile birlikte gelir; bu nedenle sıkıştırma ek kurulum gerektirmeden çevrimdışı ve hava boşluklu ortamlarda da çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları sürükleyerek bir veya daha fazla PDF yükleyin.
2. Bir **Sıkıştırma Düzeyi** seçin: Düşük, Orta, Yüksek veya Kayıpsız.
3. İsterseniz bir **Hedef Dosya Boyutu** girin veya **Gri tonlamaya dönüştür** dahil ince ayarlar için **Özel Ayarlar**'ı genişletin.
4. **PDF Sıkıştır**'a tıklayın. Birden çok dosyada tek bir ZIP indirirsiniz.

## Özel Belgeler

- **Dijital olarak imzalanmış PDF'ler** değiştirilmeden döndürülür, çünkü her değişiklik imzayı geçersiz kılar. İmzaları kaldırıp sıkıştırmak için Özel Ayarlar altında **İçerik korumasını geçersiz kıl**'ı açın; görünür imza sayfada kalır ancak dosya artık imzalı değildir.
- **PDF/A dosyaları** sıkıştırmadan sonra PDF/A etiketini kaybeder; böylece dosya artık karşılamadığı bir uyumluluğu asla iddia etmez. Dosyanın uyumlu kalması için Özel Ayarlar altında **PDF/A'yı koru**'yu açın.
- **Parola korumalı PDF'ler** dosya kartında bir parola alanı alır. Parolayı oraya girin; Hyper Compress dosyayı kendisi açar, ayrı bir kilit açma adımı gerekmez. İki veya daha fazla kilitli dosya varsa, ortak bir alan aynı parolayı kullanan tüm dosyaların kilidini açar. Sıkıştırılmış kopyanın parolası yoktur; yeniden eklemek için [PDF'yi Parolayla Koru](./protect-pdf) aracını kullanın.
- **Metin katmanı olmayan taramalar**, Özel Ayarlar altındaki **Sayfaları rasterleştir** ile daha da küçülebilir; bu seçenek her sayfayı tek bir optimize edilmiş görselle değiştirir. OCR uygulanmış taramalar dahil, seçilebilir metni olan her belge için atlanır; ancak **İçerik korumasını geçersiz kıl** açıksa atlanmaz. O zaman metin sayfaları da görsele dönüşür, dolayısıyla metin seçilemez olur ve bağlantılar çalışmaz.

## Sıkıştırma Düzeyleri

| Düzey        | Görsel Kalitesi       | Maks. Çözünürlük | En Uygun Kullanım                |
| ------------ | --------------------- | ---------------- | -------------------------------- |
| **Düşük**    | 80                    | 200 DPI          | Görsel kaliteyi korumak          |
| **Orta**     | 50                    | 150 DPI          | Günlük belgeler                  |
| **Yüksek**   | 20                    | 72 DPI           | E-posta ekleri, web'e yüklemeler |
| **Kayıpsız** | Görsellere dokunulmaz | Değişmez         | Arşiv kopyaları                  |

Yüksek düzey ayrıca 14 standart PDF yazı tipinin gömülmesini kaldırır; güvenli olduğunda Arial gibi benzer yazı tiplerini de kaldırır.

## Hedef Dosya Boyutu

KB veya MB cinsinden bir boyut girin; Hyper Compress, seçtiğiniz düzeyden başlayarak yine de sığan en iyi görsel kalitesini arar. Belge o kadar küçülemiyorsa, üretebileceği en küçük sürümü ve bunu belirten bir mesajı alırsınız. [PDF'yi 1MB'a Sıkıştır](https://www.bentopdf.com/compress-pdf-to-1mb) gibi özel sayfalar, hedef zaten doldurulmuş olarak açılır.

## Özel Ayarlar

Hyper Compress'i doğrudan ayarlamak için Özel Ayarlar panelini genişletin. Bir sıkıştırma düzeyi seçmek bunları o düzeyin değerlerine sıfırlar ve herhangi birini düzenlemek düzeyi Özel'e geçirir.

- **İçerik korumasını geçersiz kıl**: Varsayılan olarak Hyper Compress imzalı PDF'lere dokunmaz ve metni olan sayfaları rasterleştirmez. Bunu açmak her ikisini de devre dışı bırakır. Düzeyi değiştirdiğinizde açık kalır.

- **Görseller**: görsel kalitesi, maksimum çözünürlük, zorunlu yeniden örnekleme, renk azaltma, görünmez görsel alanlarını kırpma, alternatif görselleri kaldırma, renk profillerini basitleştirme, JPEG 2000 ve kayıpsız mod
- **Yazı tipleri**: alt kümeleme, yinelenenleri birleştirme ve standart yazı tiplerinin ile benzerlerinin gömülmesini kaldırma
- **İçerik**: açıklamaları, form alanlarını veya bağlantıları düzleştirme
- **Temizlik**: küçük resimleri, uygulama verilerini, makale dizilerini, web yakalama bilgilerini, yapı ağacını veya çıktı niyetlerini kaldırma
- **Rasterleştir**: yalnızca görselden oluşan taramalar için sayfaları görsellerle değiştirme; belgede seçilebilir metin varsa atlanır
- **Çıktı**: PDF/A'yı koru ve bunu destekleyen PDF 2.0 okuyucuları için Brotli sıkıştırma

## Kullanım Alanları

- 50 MB'lık bir raporu e-posta eki sınırının altına indirmek
- Hedef dosya boyutuyla bir taramayı bir portalın katı yükleme sınırının altına indirmek
- Pazarlama PDF'lerini daha hızlı web indirmeleri için optimize etmek
- Depolama maliyetinin önemli olduğu büyük belge kümelerini arşivlemek
- PDF'leri mesajlaşma uygulamalarında paylaşırken mobil veri kullanımını azaltmak

## İpuçları

- Orta ile başlayın. Sonuç hâlâ çok büyükse bir hedef dosya boyutu belirleyin veya Yüksek'e geçin.
- Metin katmanı olmayan bir tarama için Özel Ayarlar altında Sayfaları rasterleştir'i açın.
- Özel Ayarlar altındaki Gri tonlamaya dönüştür, renk ağırlıklı belgelerde dosya boyutunu düşürebilir.

## İlgili Araçlar

- [PDF'yi Doğrusallaştır](./linearize-pdf): sıkıştırılmış PDF'yi hızlı web görüntüleme için optimize edin
- [PDF'yi Rasterleştir](./rasterize-pdf): metinli sayfalar dahil sayfaları belirli bir DPI'da görsellere dönüştürün
- [PDF'yi Onar](./repair-pdf): başka bir yerde sıkıştırma sırasında bozulan bir PDF'yi düzeltin
- [Üst Veriyi Kaldır](./remove-metadata): gizlilik için gizli verileri temizleyin
