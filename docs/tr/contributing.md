# Katkıda Bulunma

BentoPDF'e katkıda bulunmak istediğiniz için teşekkürler! Bu rehber başlamanıza yardımcı olacak.

## Başlarken

### Gereksinimler

- Node.js 18+
- npm 9+
- Git

### Kurulum

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Proje Yapısı

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## Yeni Araç Ekleme

### Adım 1: Mantık Dosyasını Oluşturun

`src/js/logic/your-tool-page.ts` dosyasını oluşturun:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Adım 2: HTML Sayfasını Oluşturun

Mevcut araç şablonlarını izleyerek `src/pages/your-tool.html` dosyasını oluşturun.

### Adım 3: Aracı Kaydedin

`src/js/config/tools.ts` dosyasına ekleyin:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Adım 4: Derleme Yapılandırmasına Ekleyin

Sayfayı `vite.config.ts` dosyasına ekleyin:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Adım 5: Çevirileri Ekleyin

`public/locales/` içindeki tüm dil dosyalarına girdileri ekleyin:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Kod Stili

- Tüm yeni kodlar için TypeScript kullanın
- Tutarlılık için mevcut kalıpları izleyin
- Commit yapmadan önce `npm run format` çalıştırın
- Üretim kodunda yorum satırı kullanmayın (yorumlar derleme sırasında kaldırılır)

## Pull Request Süreci

1. Bir özellik dalı oluşturun: `git checkout -b feature/your-feature`
2. Değişikliklerinizi yapın
3. Kapsamlı şekilde test edin: `npm run build`
4. Açık bir açıklamayla PR gönderin

## Çeviri

Yeni dil eklemek için [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) dosyasına bakın.

## Katkıda Bulunan Lisans Sözleşmesi

PR'ınızın birleştirilebilmesi için CLA'mızı imzalamanız gerekir:

- [Bireysel CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Kurumsal CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Yardım Alma

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord Topluluğu](https://discord.gg/Bgq3Ay3f2w)

## Lisans

BentoPDF çift lisanslıdır:

- Kaynak kodunuzun tamamını herkese açık paylaştığınız açık kaynaklı projeler için **AGPL-3.0**
- Özel/kapalı kaynaklı uygulamalar için **Ticari Lisans** - [79$'a Ömür Boyu Lisans Alın](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Katkıda bulunarak, katkılarınızın bu koşullar altında lisanslanacağını kabul etmiş olursunuz.
