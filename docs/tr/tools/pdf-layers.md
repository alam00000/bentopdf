---
title: PDF Katmanları (OCG)
description: Bir PDF belgesindeki Optional Content Group (OCG) katmanlarını görüntüleyin, açıp kapatın, ekleyin ve silin.
---

# PDF Katmanları (OCG)

Bir PDF içindeki Optional Content Group (OCG) yapılarını, yani yaygın adıyla "katmanları", yönetin. Katman görünürlüğünü açıp kapatabilir, yeni katmanlar (iç içe alt katmanlar dahil) ekleyebilir, katmanları silebilir ve değiştirilmiş PDF'i kaydedebilirsiniz.

## Nasıl Çalışır

1. Bir PDF dosyası yükleyin.
2. Belgeyi PyMuPDF motoruyla yüklemek için işle düğmesine tıklayın.
3. Araç, mevcut tüm katmanları görünürlük durumları, kilit durumları ve iç içe hiyerarşileriyle birlikte gösterir.
4. Katmanları göstermek veya gizlemek için onay kutularını değiştirin. Kilitli katmanlar açılıp kapatılamaz.
5. Bir ad yazıp ekle düğmesine tıklayarak yeni üst düzey katmanlar ekleyin veya mevcut bir üst katmanın altına alt katmanlar ekleyin.
6. İhtiyacınız olmayan katmanları silin.
7. Katman değişiklikleri uygulanmış PDF'i indirmek için **Değiştirilmiş PDF'yi İndir** düğmesine tıklayın.

## Özellikler

- Katman hiyerarşisini, iç içe katmanlar için uygun girintiyle gösterir
- Katman görünürlüğünü açıp kapatma
- Kilitli katman göstergesi yanlışlıkla yapılacak değişiklikleri önler
- Özel adlarla üst düzey veya alt katmanlar ekleme
- Tek tek katmanları silme
- Tüm değişiklikleri yeni bir PDF dosyasına kaydeder

## Kullanım Alanları

- Mimari veya mühendislik çizimlerindeki işaretleme katmanlarının görünürlüğünü açıp kapatmak
- Çok katmanlı bir tasarım belgesine yeni açıklama katmanları eklemek
- Bir şablonu dağıtmadan önce eski katmanları kaldırmak
- Üçüncü taraftan alınan karmaşık bir PDF'te hangi katmanların bulunduğunu incelemek

## İpuçları

- PDF'te katman yoksa araç, bir katman eklemeyi öneren boş bir durum gösterir. Tüm PDF'ler OCG katmanları kullanmaz: en çok CAD dışa aktarımlarında ve tasarım dosyalarında görülür.
- Alt katmanlar, üst katmanlarının altında görsel olarak girintilidir. Katmanları istediğiniz derinliğe kadar iç içe geçirebilirsiniz.
- Kilitli katmanlar bir kilit simgesiyle gösterilir ve onay kutuları devre dışıdır. Bu kilitleri PDF'i oluşturan kişi belirler.

## İlgili Araçlar

- [Üst Veriyi Görüntüle](./view-metadata)
- [Üst Veriyi Düzenle](./edit-metadata)
- [Çoğalt & Düzenle](./organize-pdf)
