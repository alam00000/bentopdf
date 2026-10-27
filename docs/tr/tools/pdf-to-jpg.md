---
title: PDF'den JPG'ye
description: PDF sayfalarını ayarlanabilir kalitede JPG görsellerine dönüştürün. Tek sayfalı PDF'ler doğrudan iner, çok sayfalı PDF'ler ZIP olarak dışa aktarılır.
---

# PDF'den JPG'ye

Bir PDF'in her sayfasını JPG görseline dönüştürür. Tek sayfalı belgeler bağımsız bir `.jpg` dosyası olarak iner. Çok sayfalı PDF'ler, sayfa başına bir JPG içeren bir ZIP arşivi üretir.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin. Araç dosya adını, dosya boyutunu ve sayfa sayısını gösterir.
2. JPG sıkıştırmasını denetlemek için **Görüntü Kalitesi** kaydırıcısını ayarlayın.
3. İşlemeyi başlatmak için **Dönüştür** düğmesine tıklayın.
4. Sonuç otomatik olarak iner: tek sayfalı PDF'ler için tek bir JPG, çok sayfalı belgeler için bir ZIP dosyası.

## Seçenekler

- **Görüntü Kalitesi**: %0 ile %100 arasında bir kaydırıcı (varsayılan %90). Yüksek değerler daha keskin ve daha büyük dosyalı görseller üretir. Düşük değerler daha agresif sıkıştırır.

Sayfalar dahili olarak 2x ölçekte işlenir, bu nedenle çıktı çözünürlüğü PDF sayfa boyutlarının iki katıdır. Standart bir Letter boyutlu sayfa yaklaşık 1.224 x 1.584 piksellik bir görsel üretir.

## Çıktı Biçimi

- **Tek sayfa**: `filename.jpg`
- **Birden fazla sayfa**: `page_1.jpg`, `page_2.jpg` vb. içeren `filename_jpgs.zip`

## Kullanım Alanları

- Bir belge yönetim sistemi için önizleme küçük resimleri oluşturmak.
- Bir raporun bir sayfasını PDF desteklemeyen bir sohbette veya e-postada paylaşmak.
- PDF diyagramlarından veya çizimlerinden görsel varlıklar oluşturmak.
- Taranmış belgeleri tek tek görseller olarak arşivlemek.

## İpuçları

- Kayıpsız çıktı için bunun yerine [PDF'den PNG'ye](./pdf-to-png) aracını kullanın.
- %80-90 kalite ayarı, dosya boyutu ile görsel doğruluk arasında iyi bir denge sağlar.
- Sayfa başına belirli bir biçime ihtiyacınız varsa, PDF'den Görsellere çıktı düğümüne sahip [PDF İş Akışı Oluşturucu](./pdf-workflow) aracını değerlendirin.

## İlgili Araçlar

- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den WebP'ye](./pdf-to-webp)
- [PDF'den BMP'ye](./pdf-to-bmp)
- [PDF'den TIFF'e](./pdf-to-tiff)
