---
title: ODT'den PDF'ye
description: OpenDocument Text (ODT) dosyalarını, LibreOffice tabanlı bir motorla tarayıcınızda PDF biçimine dönüştürün.
---

# ODT'den PDF'ye

OpenDocument Text dosyalarını PDF'ye dönüştürün. ODT, LibreOffice Writer, Apache OpenOffice ve diğer açık kaynaklı kelime işlemcilerin yerel biçimidir. Bu araç, biçimlendirmeyi, tabloları, görselleri ve stilleri koruyan doğru dönüştürmeler üretmek için tarayıcıda çalışan bir LibreOffice motoru kullanır.

## Desteklenen Biçimler

| Biçim             | Uzantılar |
| :---------------- | :-------- |
| OpenDocument Text | `.odt`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya bir ya da daha fazla ODT dosyasını sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Daha fazla dosya ekleyin veya istemediklerinizi kaldırın.
3. **PDF'ye Dönüştür** düğmesine tıklayın. LibreOffice motoru başlatılır (bir ilerleme göstergesi yükleme durumunu gösterir), ardından her dosya dönüştürülür.
4. Tek bir dosya doğrudan PDF olarak iner. Birden fazla dosya `odt-converted.zip` içinde paketlenir.

## Seçenekler

Bu araçta ek bir yapılandırma yoktur. Dönüştürme, özgün belgenin biçimlendirmesini mümkün olduğunca yakından korur.

## Çıktı

| Girdi Sayısı | Çıktı                                                          |
| :----------- | :------------------------------------------------------------- |
| 1 dosya      | Tek bir PDF indirmesi (ör. `document.pdf`)                     |
| 2+ dosya     | Her dosya için bir PDF içeren ZIP arşivi (`odt-converted.zip`) |

## Kullanım Alanları

- LibreOffice Writer belgelerini Microsoft Office kullanıcılarıyla paylaşmak için PDF'ye dönüştürmek
- OpenDocument biçiminde yazılmış akademik makalelerden baskıya hazır PDF'ler üretmek
- Bir klasördeki ODT şablonlarını dağıtım için toplu olarak PDF'ye dönüştürmek
- Otomatik belge oluşturma sistemlerinin ürettiği ODT dosyalarından PDF üretmek

## İpuçları

- LibreOffice motoru ilk kullanımda yüklenir ve sonraki dönüştürmeler için önbelleğe alınır. İlk yükleme birkaç saniye sürer; ardından dönüştürmeler hızlıdır.
- Gömülü OLE nesneleri veya alışılmadık yazı tipleri içeren karmaşık belgeler, masaüstü LibreOffice'ten biraz farklı görüntülenebilir. Toplu dönüştürmeden önce bir örnekle deneyin.
- Word belgeleri (`.doc`, `.docx`) için bunun yerine [Word'den PDF'ye](./word-to-pdf) aracını kullanın. O da LibreOffice motorunu kullanır ancak Microsoft biçimlerini doğrudan kabul eder.

## İlgili Araçlar

- [Word'den PDF'ye](./word-to-pdf)
- [RTF'den PDF'ye](./rtf-to-pdf)
- [Metinden PDF'ye](./txt-to-pdf)
