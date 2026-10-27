# Triển khai lên Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) cung cấp dịch vụ lưu trữ trang tĩnh toàn cầu, nhanh, với băng thông không giới hạn.

## Triển khai nhanh

1. Vào [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Nhấp "Create a project"
3. Kết nối kho GitHub của bạn

## Cấu hình build

| Cài đặt                | Giá trị         |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Biến môi trường

Thêm các biến này trong Settings → Environment variables:

| Biến                    | Giá trị                                              |
| ----------------------- | ---------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                 |
| `SIMPLE_MODE`           | `false` (tùy chọn)                                   |
| `VITE_BRAND_NAME`       | Tên thương hiệu tùy chỉnh (tùy chọn)                 |
| `VITE_BRAND_LOGO`       | Đường dẫn logo tương đối so với `public/` (tùy chọn) |
| `VITE_FOOTER_TEXT`      | Văn bản chân trang/bản quyền tùy chỉnh (tùy chọn)    |
| `VITE_DEFAULT_LANGUAGE` | Ngôn ngữ giao diện mặc định, ví dụ `fr` (tùy chọn)   |

## Tệp cấu hình

Tạo `_headers` trong thư mục `public` của bạn:

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning Quan trọng
Các header `Cross-Origin-Embedder-Policy` và `Cross-Origin-Opener-Policy` là bắt buộc cho việc chuyển Word/ODT/Excel/PowerPoint sang PDF. Nếu thiếu, `SharedArrayBuffer` sẽ không khả dụng và engine LibreOffice WASM sẽ không khởi tạo được.
:::

Tạo `_redirects` cho định tuyến SPA:

```
/*    /index.html   200
```

## Tên miền tùy chỉnh

1. Vào dự án Pages của bạn
2. Nhấp "Custom domains"
3. Thêm tên miền của bạn
4. Cloudflare sẽ tự động cấu hình DNS nếu tên miền nằm trên Cloudflare

## Ưu điểm

- **Băng thông không giới hạn, miễn phí**
- **CDN toàn cầu** với hơn 300 điểm biên
- **HTTPS tự động**
- **Bản triển khai xem trước** cho pull request
- **Build nhanh**

## Khắc phục sự cố

### Tải lên tệp lớn

Cloudflare Pages hỗ trợ tệp tối đa 25 MB. Các module WASM thường ổn, nhưng nếu bạn chạm giới hạn, hãy cân nhắc:

```bash
# Split large files during build
npm run build
```

### Giới hạn kích thước Worker

Nếu dùng Cloudflare Workers cho định tuyến nâng cao, lưu ý giới hạn 1 MB cho gói miễn phí.

## CORS Proxy Worker (cho chữ ký số)

Công cụ Chữ ký số cần một CORS proxy để lấy chuỗi chứng chỉ. Hãy triển khai worker đi kèm:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Tính năng bảo mật

| Tính năng                   | Mô tả                           |
| --------------------------- | ------------------------------- |
| **Hạn chế URL**             | Chỉ cho phép URL chứng chỉ      |
| **Giới hạn kích thước tệp** | Tối đa 10MB mỗi yêu cầu         |
| **Giới hạn tốc độ**         | 60 yêu cầu/IP/phút (cần KV)     |
| **Chặn IP riêng**           | Chặn localhost và các IP nội bộ |

### Bật giới hạn tốc độ

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Build với URL proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Hoặc với Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Lưu ý:** Xem [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) để biết cách thiết lập chữ ký HMAC.
