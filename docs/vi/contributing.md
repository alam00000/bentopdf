# Đóng góp

Cảm ơn bạn đã quan tâm đến việc đóng góp cho BentoPDF! Hướng dẫn này sẽ giúp bạn bắt đầu.

## Bắt đầu

### Yêu cầu

- Node.js 18+
- npm 9+
- Git

### Cài đặt

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Cấu trúc dự án

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

## Thêm công cụ mới

### Bước 1: Tạo tệp logic

Tạo `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Bước 2: Tạo trang HTML

Tạo `src/pages/your-tool.html` theo các mẫu công cụ hiện có.

### Bước 3: Đăng ký công cụ

Thêm vào `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Bước 4: Thêm vào cấu hình build

Thêm trang vào `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Bước 5: Thêm bản dịch

Thêm các mục vào tất cả tệp locale trong `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Phong cách mã

- Dùng TypeScript cho mọi mã mới
- Tuân theo các mẫu hiện có để nhất quán
- Chạy `npm run format` trước khi commit
- Không viết chú thích trong mã production (chú thích bị xóa khi build)

## Quy trình Pull Request

1. Tạo nhánh tính năng: `git checkout -b feature/your-feature`
2. Thực hiện thay đổi của bạn
3. Kiểm tra kỹ lưỡng: `npm run build`
4. Gửi PR kèm mô tả rõ ràng

## Dịch thuật

Xem [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) để biết cách thêm ngôn ngữ mới.

## Thỏa thuận cấp phép cho người đóng góp

Trước khi PR của bạn được merge, bạn cần ký CLA của chúng tôi:

- [CLA cá nhân (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [CLA doanh nghiệp (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Nhận trợ giúp

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Cộng đồng Discord](https://discord.gg/Bgq3Ay3f2w)

## Giấy phép

BentoPDF được cấp phép kép:

- **AGPL-3.0** cho các dự án mã nguồn mở công khai toàn bộ mã nguồn của mình
- **Giấy phép thương mại** cho các ứng dụng độc quyền/mã nguồn đóng - [Nhận giấy phép trọn đời với giá $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Khi đóng góp, bạn đồng ý rằng các đóng góp của mình sẽ được cấp phép theo các điều khoản này.
