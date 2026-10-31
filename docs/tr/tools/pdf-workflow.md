---
title: PDF İş Akışı Oluşturucu
description: Bir tuval üzerinde düğümleri bağlayarak özel PDF işleme hatlarını görsel olarak oluşturun. Birleştirme, sıkıştırma, filigran ve dışa aktarma gibi işlemleri zincirleyin.
---

# PDF İş Akışı Oluşturucu

İş Akışı Oluşturucu, birden fazla PDF işlemini tek bir otomatik hatta zincirlemenizi sağlar. Araçları tek tek çalıştırmak yerine; giriş, işleme ve çıktı düğümlerinden oluşan görsel bir grafik kurar ve her şeyi tek tıklamayla yürütürsünüz. Dosyalarınız tarayıcıdan asla çıkmaz.

## Nasıl Çalışır

Arayüz üç panele ayrılmıştır: solda bir **düğüm araç kutusu**, ortada **tuval** ve bir düğüm seçtiğinizde sağda beliren bir **ayarlar paneli**.

1. Sol kenar çubuğundan düğümlere tıklayarak veya doğrudan tuvale sürükleyerek **düğüm ekleyin**. Ada göre süzmek için araç kutusunun üstündeki arama çubuğunu kullanın.
2. Bir çıkış soketinden (düğümün altı) başka bir düğümün giriş soketine (üstü) sürükleyerek **düğümleri bağlayın**. Bağlantılar yukarıdan aşağıya akar.
3. Bir düğüme tıklayıp sağdaki ayarlar panelini açarak **ayarları yapılandırın**. Her düğüm türünün kendi seçenekleri vardır (sayfa aralıkları, kalite kaydırıcıları, parolalar vb.).
4. Araç çubuğundaki **Çalıştır** düğmesine tıklayarak **iş akışını çalıştırın**. Motor, düğümleri topolojik sırayla yürütür ve her birini sırayla işler. Alttaki durum çubuğu ilerlemeyi izler.
5. **Sonuçları indirin**: son İndir düğümü nihai PDF'i (birden fazla dosya üretilirse ZIP'i) kaydeder.

## Düğüm Kategorileri

Düğümler, tuval üzerinde renk kodlu altı kategoride düzenlenmiştir:

- **Giriş** (mavi): PDF Girişi, Görsel Girişi, Word/Excel/PowerPoint'ten PDF'ye ve iş akışına dosya besleyen 15'ten fazla diğer biçim dönüştürücü.
- **Düzenle & Açıklama Ekle** (çivit mavisi): PDF Kırp, PDF'yi Gri Tonlamaya Çevir, Renkleri Ters Çevir, Filigran Ekle, Sayfa Numaraları, Üst Bilgi & Alt Bilgi, Tarayıcı Efekti, Renkleri Ayarla, Arka Plan Rengi, Boş Sayfaları Kaldır, Açıklamaları Kaldır.
- **Düzenle & Yönet** (mor): PDF Birleştir, PDF Böl, Sayfaları Çıkar, PDF'yi Döndür, Sayfaları Sil, Sayfaları Ters Çevir, Boş Sayfa Ekle, Sayfaları Böl, N'li PDF, Sayfa Boyutunu Düzelt, Tek Sayfada Birleştir, PDF Kitapçık, PDF'yi Posterleştir, Üst Veriyi Düzenle, İçindekiler, PDF'de OCR.
- **Optimize Et & Onar** (kehribar): PDF Sıkıştır, PDF'yi Rasterleştir, PDF'yi Doğrusallaştır, PDF Eğriliğini Düzelt, PDF'den PDF/A'ya, Yazı Tipini Ana Hatlara Dönüştür, PDF'yi Onar.
- **PDF Güvenliği** (gül kırmızısı): Şifrele, Şifreyi Çöz, PDF'yi Temizle, PDF'yi Düzleştir, Dijital İmza, Karart.
- **Çıkış** (deniz mavisi): İndir (tek PDF ile ZIP'i otomatik algılar), PDF'den Görsellere, PDF'den Metne, PDF'den DOCX'e, PDF'den XLSX'e, PDF'den CSV'ye, PDF'den SVG'ye, PDF'den Markdown'a, Görüntüleri Çıkar.

## İş Akışlarını Kaydetme ve Yükleme

Araç çubuğu dört kalıcılık seçeneği sunar:

- **Kaydet**: geçerli iş akışını tarayıcınızın yerel depolama alanında adlandırılmış bir şablon olarak saklar. Birden fazla şablon kaydedebilirsiniz.
- **Yükle**: kayıtlı tüm şablonları listeleyen bir pencere açar. Birini geri yüklemek için Yükle'ye tıklayın veya artık ihtiyacınız olmayan şablonları silin.
- **Dışa Aktar**: iş akışını paylaşabilmeniz veya yedekleyebilmeniz için bir `.json` dosyası olarak indirir.
- **İçe Aktar**: diskten bir `.json` iş akışı dosyası yükler ve tüm düğümleri, konumları ve bağlantıları geri getirir.

Şablonlar oturumlar arasında yerel depolamada kalır. Dışa aktarılan JSON dosyaları tarayıcılar ve makineler arasında taşınabilir.

## Yürütme Modeli

Motor, bağlantılarınızdan bir bağımlılık grafiği oluşturur ve düğümleri topolojik sırayla yürütür. Herhangi bir düğüm başarısız olursa yürütme durur ve başarısız düğüm kırmızı işaretlenir. Akılda tutulması gereken birkaç kural:

- Her iş akışı en az bir **Giriş** düğümüne ve bir **Çıkış** düğümüne ihtiyaç duyar.
- Motor döngüsel bağımlılıkları algılar ve yürütmeyi bir hatayla engeller.
- **Şifrele** düğümü, çıktı düğümünden önceki son işleme adımı olmalıdır. Daha erkene yerleştirmek bir doğrulama uyarısı tetikler, çünkü sonraki düğümler şifrelenmiş veri üzerinde çalışamaz.
- Parola korumalı PDF'ler yürütme sırasında parola ister.
- Çoklu PDF girişleri desteklenir: PDF Birleştir düğümü bunları birleştirebilir veya toplu işleme düğümleri her PDF'i ayrı ayrı işler.

## Soket Türleri

Bağlantılar, geçersiz bağlantıları önlemek için türlendirilmiş soketler kullanır:

- **PDF** (çivit mavisi): tek bir PDF belgesi.
- **MultiPDF** (kehribar): birlikte paketlenmiş birden fazla PDF belgesi.
- **Image** (yeşil): bir görsel blobu.

## Seçenekler

Her düğümün, sağdaki ayarlar paneliyle erişilen kendi yapılandırması vardır. Yaygın örüntüler şunlardır:

- PDF Böl, Sayfaları Çıkar, Sayfaları Sil düğümlerinde **sayfa aralıkları**
- Görsel dönüştürme çıktı düğümlerinde **kalite kaydırıcıları**
- Şifrele ve Şifreyi Çöz düğümlerinde **parola alanları**
- Filigran Ekle, Üst Bilgi & Alt Bilgi, Üst Veriyi Düzenle için **metin girişleri**
- PDF'yi Döndür düğümünde **döndürme açıları**
- PDF Sıkıştır düğümünde **sıkıştırma düzeyi**
- PDF'de OCR düğümünde **OCR dil seçimi**

## Kullanım Alanları

- **Fatura işleme hattı**: PDF Girişi -> PDF'de OCR -> PDF Tablolarını Çıkar -> CSV olarak İndir.
- **Rapor standardizasyonu**: Word'den PDF'ye -> Sayfa Boyutunu Düzelt -> Sayfa Numaraları -> Filigran Ekle -> PDF Sıkıştır -> İndir.
- **Arşiv hazırlığı**: PDF Girişi -> PDF'yi Onar -> PDF'yi Düzleştir -> PDF'yi Temizle -> PDF'den PDF/A'ya -> İndir.
- **Toplu görsel çıkarma**: PDF Girişi (birden fazla dosya) -> Görüntüleri Çıkar -> ZIP olarak İndir.
- **Baskıya hazır kitapçıklar**: PDF Girişi -> PDF Kitapçık -> PDF Kırp -> PDF Sıkıştır -> İndir.
- **Güvenli dağıtım**: PDF Girişi -> Karart -> Açıklamaları Kaldır -> Şifrele -> İndir.

## İpuçları

- Seçili düğümü tuvalden kaldırmak için **Delete** veya **Backspace** tuşunu kullanın.
- Bir düğümün durum çubuğundaki **X** düğmesine tıklayarak doğrudan silebilirsiniz.
- Boş alana tıklayıp sürükleyerek tuvali kaydırın. Kaydırma sırasında imleç bir tutma simgesine dönüşür.
- Mobilde, düğüm araç kutusunu açıp kapatmak için araç çubuğundaki **+** düğmesini kullanın.
- İş akışınız birden fazla çıktı dosyası üretirse İndir düğümü bunları otomatik olarak bir ZIP içinde paketler.
- Basit başlayın: karmaşıklık eklemeden önce iki düğümlü bir hat oluşturup test edin.

## İlgili Araçlar

- [PDF'den Metne](./pdf-to-text)
- [PDF'den Excel'e](./pdf-to-excel)
- [Görüntüleri Çıkar](./extract-images)
- [PDF'den Markdown'a](./pdf-to-markdown)
