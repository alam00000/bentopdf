---
title: Word'den PDF'ye
description: Word belgelerini (DOC, DOCX), ODT ve RTF dosyalarını biçimlendirmeyi tam koruyarak tarayıcınızda PDF'ye dönüştürün.
---

# Word'den PDF'ye

Microsoft Word belgelerini ve uyumlu biçimleri PDF'ye dönüştürün. Araç, DOC, DOCX, ODT ve RTF dosyalarını işleyen, tarayıcı tabanlı bir LibreOffice motoru kullanır ve çıktıda biçimlendirmeyi, tabloları, görselleri, üst bilgileri, alt bilgileri ve stilleri korur.

## Desteklenen Biçimler

| Biçim             | Uzantılar |
| :---------------- | :-------- |
| Word (modern)     | `.docx`   |
| Word (eski)       | `.doc`    |
| OpenDocument Text | `.odt`    |
| Rich Text Format  | `.rtf`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya Word belgelerinizi sürükleyip bırakın. Birden fazla dosya aynı anda seçilebilir.
2. Dosya listesini gözden geçirin ve yönetin.
3. **PDF'ye Dönüştür** düğmesine tıklayın. LibreOffice motoru ilk kullanımda yüklenir (bir ilerleme göstergesi başlatma durumunu gösterir), ardından her dosya dönüştürülür.
4. Tek dosya doğrudan PDF olarak indirilir. Birden fazla dosya `word-converted.zip` içinde paketlenir.

## Seçenekler

Bu aracın ek ayarı yoktur. LibreOffice motoru çıktıyı varsayılan PDF dışa aktarma profiliyle üretir.

## Çıktı

| Girdi Sayısı | Çıktı                                                           |
| :----------- | :-------------------------------------------------------------- |
| 1 dosya      | Tek PDF indirmesi (özgün dosya adı, `.pdf` uzantısıyla)         |
| 2+ dosya     | Her dosya için bir PDF içeren ZIP arşivi (`word-converted.zip`) |

## Kullanım Alanları

- İş başvurusu yapmadan önce özgeçmişi veya ön yazıyı DOCX'ten PDF'ye dönüştürmek
- Bir müşteriye teslim için bir dizi sözleşmeyi veya teklifi toplu olarak PDF'ye dönüştürmek
- Eski `.doc` dosyalarını uzun vadeli arşivleme için modern PDF'lere çevirmek
- Google Docs'tan DOCX olarak dışa aktarılan ortak belgeleri PDF'ye dönüştürmek
- Otomatik belge üretiminde kullanılan Word şablonlarından baskıya hazır PDF'ler üretmek

## İpuçları

- LibreOffice motoru oturum başına bir kez indirilir ve önbelleğe alınır. İlk dönüştürmede birkaç saniyelik yükleme süresi beklenir, sonraki dönüştürmeler çok daha hızlıdır.
- Karmaşık biçimlendirme (makrolar, ActiveX denetimleri, gelişmiş SmartArt) mükemmel dönüşmeyebilir. Metin, tablolar, görseller, üst bilgiler ve dipnotlar gibi standart belge öğeleri güvenilir biçimde dönüşür.
- Bu araç ODT ve RTF'yi de kabul ettiği için tüm kelime işlemci biçimleri için tek duraklı bir dönüştürücü olarak kullanabilirsiniz.

## İlgili Araçlar

- [ODT'den PDF'ye](./odt-to-pdf)
- [RTF'den PDF'ye](./rtf-to-pdf)
- [Excel'den PDF'ye](./excel-to-pdf)
- [PowerPoint'ten PDF'ye](./powerpoint-to-pdf)
