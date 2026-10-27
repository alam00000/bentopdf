---
title: Görüntüleri Çıkar
description: PDF dosyalarındaki gömülü tüm görüntüleri çıkarın. Bir ızgarada önizleyin, tek tek veya ZIP arşivi olarak indirin.
---

# Görüntüleri Çıkar

Bir veya daha fazla PDF dosyasındaki gömülü her görüntüyü çıkarır. Çıkarılan görüntüler, tek tek indirebileceğiniz veya hepsini bir kerede ZIP olarak alabileceğiniz bir önizleme ızgarasında gösterilir. PyMuPDF ile çalışır.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya dosyaları üzerine sürükleyerek bir veya daha fazla PDF yükleyin. Gerektiğinde daha fazla dosya ekleyin veya tek tek kaldırın.
2. İşlemeyi başlatmak için **Çıkar**'a tıklayın.
3. Araç, yüklenen her PDF'nin her sayfasını tarar, gömülü görüntüleri bulur ve çıkarır.
4. Çıkarılan görüntüler küçük resimlerle bir ızgarada görünür. Her görüntünün bir indirme düğmesi vardır.
5. Hepsini ZIP arşivi olarak kaydetmek için **Tümünü İndir**'e tıklayın.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Gömülü tüm görüntüler özgün biçimlerinde çıkarılır (genellikle PNG, JPEG veya görüntü PDF'ye gömülürken hangi biçim kullanıldıysa o).

## Çıktı Biçimi

- Görüntüler önizleme ızgarasında `image_1.png`, `image_2.jpg` gibi adlarla görünür.
- **Tümünü İndir**, tüm görüntüleri içeren `extracted-images.zip` dosyasını üretir.
- Görüntüler ızgaradan tek tek indirilebilir.

## Kullanım Alanları

- Bir PDF'deki fotoğrafları veya grafikleri başka bir projede yeniden kullanmak için kurtarmak.
- Bir e-ticaret listesi için katalog PDF'sinden ürün görsellerini çıkarmak.
- Sunumlarda kullanmak üzere teknik belgelerden diyagramları çıkarmak.
- Bir belgeyi paylaşmadan önce hangi görüntülerin gömülü olduğunu denetlemek.

## İpuçları

- Araç görüntüleri PDF'de saklandıkları gibi çıkarır. Sayfaları görüntü olarak yeniden işlemez; bunun için [PDF'den PNG'ye](./pdf-to-png) veya [PDF'den JPG'ye](./pdf-to-jpg) araçlarını kullanın.
- Araç "Görüntü Bulunamadı" bildirirse PDF gömülü raster görüntüler yerine vektör grafikler kullanıyor olabilir veya tüm sayfanın tek büyük görüntü olduğu taranmış bir belge olabilir.
- Toplu işleme birden çok PDF genelinde çalışır. Tüm dosyalardaki tüm görüntüler tek bir ızgarada ve ZIP'te birleştirilir.

## İlgili Araçlar

- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF İş Akışı Oluşturucu](./pdf-workflow)
