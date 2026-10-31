---
title: XPS'ten PDF'ye
description: XPS ve OXPS belgelerini tarayıcınızda PDF biçimine dönüştürün. Yükleme yok, kayıt yok, tamamen gizli.
---

# XPS'ten PDF'ye

Microsoft XPS ve OXPS belgelerini standart PDF dosyalarına dönüştürün. XPS (XML Paper Specification), Microsoft'un PDF'ye yanıtıydı, ancak platformlardaki desteği giderek azaldı. Bu araç söz konusu belgeleri yeniden herkesin okuyabileceği hale getirir.

## Desteklenen Biçimler

| Biçim | Uzantı  | Notlar                                |
| :---- | :------ | :------------------------------------ |
| XPS   | `.xps`  | Özgün Microsoft XPS biçimi            |
| OXPS  | `.oxps` | Open XPS, ECMA-388 standardı varyantı |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya XPS/OXPS dosyalarınızı sürükleyip bırakın. Birden fazla dosyayı aynı anda seçebilirsiniz.
2. Dosya listesini gözden geçirin. Tek tek dosyaları çöp kutusu simgesiyle kaldırın veya ek belgeler eklemek için **Daha Fazla Dosya Ekle** seçeneğine tıklayın.
3. **PDF'ye Dönüştür** düğmesine tıklayın. PyMuPDF motoru her belgeyi tarayıcınızda yerel olarak işler.
4. Tek dosya doğrudan PDF olarak indirilir. Birden fazla dosya `xps-converted.zip` adlı bir ZIP arşivinde toplanır.

## Seçenekler

Bu araç ek yapılandırma olmadan doğrudan biçim dönüştürme yapar. Çıktı, XPS kaynağındaki özgün sayfa boyutlarını, vektör grafiklerini, yazı tiplerini ve görselleri korur.

## Kullanım Alanları

- Varsayılan olarak XPS yazdırma sürücüsünü kullanan eski Windows sistemlerinden gelen XPS dosyalarını açmak
- Windows 10/11'den gelen OXPS belgelerini macOS veya Linux kullanıcılarıyla paylaşmak için dönüştürmek
- Eski XPS dosyalarını daha yaygın desteklenen bir biçimde arşivlemek
- XPS tabanlı resmi veya kurumsal belgeleri dış alıcılar için erişilebilir kılmak

## İpuçları

- Hem `.xps` hem de `.oxps` uzantıları otomatik olarak işlenir, aynı toplu işte karıştırabilirsiniz.
- Özgün XPS dosyası yüksek çözünürlüklü bir yazdırma sürücüsüyle oluşturulduysa, ortaya çıkan PDF bu kaliteyi korur. Yeniden örnekleme yapılmaz.

## İlgili Araçlar

- [Word'den PDF'ye](./word-to-pdf)
- [XML'den PDF'ye](./xml-to-pdf)
