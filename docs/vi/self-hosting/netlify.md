# Triển khai lên Netlify

[Netlify](https://netlify.com) cung cấp dịch vụ lưu trữ trang web tĩnh xuất sắc với gói miễn phí hào phóng.

## Triển khai một lần nhấp

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Triển khai thủ công

### Bước 1: Kết nối repository

1. Đăng nhập vào [Netlify](https://app.netlify.com)
2. Nhấp "Add new site" → "Import an existing project"
3. Kết nối tài khoản GitHub của bạn
4. Chọn bản fork BentoPDF của bạn

### Bước 2: Cấu hình thiết lập dựng

| Thiết lập         | Giá trị         |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Bước 3: Triển khai

Nhấp "Deploy site" và đợi quá trình dựng hoàn tất.

## Tệp cấu hình

Tạo `netlify.toml` ở thư mục gốc của dự án:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning Quan trọng
Các header `Cross-Origin-Embedder-Policy` và `Cross-Origin-Opener-Policy` là bắt buộc cho việc chuyển Word/ODT/Excel/PowerPoint sang PDF. Thiếu chúng, `SharedArrayBuffer` sẽ không khả dụng và engine LibreOffice WASM sẽ không khởi tạo được.

Các header `Content-Encoding: gzip` trên tệp `.wasm.gz` và `.data.gz` báo cho trình duyệt tự động giải nén chúng. Thiếu chúng, trình duyệt nhận dữ liệu gzip thô và quá trình biên dịch WASM sẽ thất bại.
:::

## Biến môi trường

Đặt các biến này tại Site settings → Environment variables:

| Variable                | Mô tả                                                         |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Đặt là `true` để dựng bản tối giản                            |
| `VITE_BRAND_NAME`       | Tên thương hiệu tùy chỉnh (thay cho "BentoPDF")               |
| `VITE_BRAND_LOGO`       | Đường dẫn logo tính từ `public/` (ví dụ `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Văn bản chân trang / bản quyền tùy chỉnh                      |
| `VITE_DEFAULT_LANGUAGE` | Ngôn ngữ giao diện mặc định (ví dụ `fr`, `de`, `es`)          |

## Tên miền tùy chỉnh

1. Vào Site settings → Domain management
2. Nhấp "Add custom domain"
3. Làm theo hướng dẫn cấu hình DNS

## Phương tiện dung lượng lớn

Với các tệp WASM lớn, hãy cân nhắc bật [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Khắc phục sự cố

### Chuyển Word/ODT/Excel sang PDF bị đứng ở 55%

Nếu quá trình chuyển đổi tài liệu bị treo ở 55%, hãy mở Console của DevTools và kiểm tra:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Nếu `crossOriginIsolated` là `false`, các header COEP/COOP từ `netlify.toml` của bạn chưa được áp dụng. Hãy đảm bảo tệp nằm ở thư mục gốc dự án rồi triển khai lại.

Nếu bạn thấy `expected magic word 00 61 73 6d, found 1f 8b 08 08` trong console, các tệp `.wasm.gz` đang thiếu header `Content-Encoding: gzip`. Hãy đảm bảo các khối `[[headers]]` cho `soffice.wasm.gz` và `soffice.data.gz` có trong `netlify.toml` của bạn.

### Dựng thất bại

Kiểm tra tính tương thích phiên bản Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Tải lần đầu chậm

Bật tối ưu hóa tài nguyên tại Site settings → Build & deploy → Asset optimization.
