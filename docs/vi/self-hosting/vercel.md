# Triển khai lên Vercel

[Vercel](https://vercel.com) mang lại trải nghiệm triển khai dễ nhất cho các trang web tĩnh.

## Triển khai một lần nhấp

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Triển khai thủ công

### Bước 1: Fork repository

Fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) về tài khoản GitHub của bạn.

### Bước 2: Nhập vào Vercel

1. Truy cập [vercel.com/new](https://vercel.com/new)
2. Chọn repository đã fork của bạn
3. Cấu hình dự án:

| Thiết lập        | Giá trị         |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Bước 3: Biến môi trường (tùy chọn)

Thêm các biến này nếu cần:

| Variable                | Mô tả                                                         |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Đặt là `true` để có giao diện tối giản                        |
| `VITE_BRAND_NAME`       | Tên thương hiệu tùy chỉnh (thay cho "BentoPDF")               |
| `VITE_BRAND_LOGO`       | Đường dẫn logo tính từ `public/` (ví dụ `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Văn bản chân trang / bản quyền tùy chỉnh                      |
| `VITE_DEFAULT_LANGUAGE` | Ngôn ngữ giao diện mặc định (ví dụ `fr`, `de`, `es`)          |

### Bước 4: Triển khai

Nhấp "Deploy" và đợi quá trình dựng hoàn tất.

## Tên miền tùy chỉnh

1. Vào phần cài đặt dự án của bạn
2. Chuyển đến "Domains"
3. Thêm tên miền tùy chỉnh của bạn
4. Cấu hình DNS theo hướng dẫn

## Hạn chế

::: warning Tệp lớn
Các serverless function của Vercel có giới hạn 50MB. Vì BentoPDF là trang web tĩnh nên điều này không ảnh hưởng đến bạn, nhưng các mô-đun WASM khá lớn (tổng cộng ~100MB). Hãy đảm bảo chúng được phục vụ từ thư mục `/public`.
:::

## Khắc phục sự cố

### Hết thời gian dựng

Nếu quá trình dựng bị hết thời gian, hãy thử:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Lỗi 404 khi làm mới trang

Thêm `vercel.json` để định tuyến SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Chuyển Word/ODT/Excel sang PDF không hoạt động

Việc chuyển đổi LibreOffice WASM cần `SharedArrayBuffer`, thứ đòi hỏi các header phản hồi sau trên mọi trang:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Các tệp `.wasm.gz` và `.data.gz` đã nén sẵn cũng cần `Content-Encoding: gzip` để trình duyệt giải nén chúng.

Thêm các mục này vào `vercel.json` của bạn:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Để kiểm tra, mở Console của DevTools và chạy `console.log(window.crossOriginIsolated)`: kết quả phải là `true`.
