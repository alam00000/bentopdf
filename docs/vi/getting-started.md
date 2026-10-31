# Bắt đầu

Chào mừng bạn đến với BentoPDF! Hướng dẫn này giúp bạn bắt đầu nhanh chóng.

## BentoPDF là gì?

BentoPDF là bộ công cụ PDF miễn phí, mã nguồn mở, đặt quyền riêng tư lên hàng đầu và chạy **hoàn toàn trong trình duyệt của bạn**. Tệp của bạn không bao giờ rời khỏi thiết bị, mọi xử lý đều diễn ra cục bộ bằng công nghệ WebAssembly (WASM).

## Bắt đầu nhanh

### Cách 1: Dùng phiên bản trực tuyến

Truy cập [bentopdf.com](https://www.bentopdf.com) để dùng BentoPDF ngay, không cần cài đặt.

### Cách 2: Tự lưu trữ bằng Docker

> [!IMPORTANT]
> Chuyển đổi tệp Office cần `SharedArrayBuffer`, và điều này đòi hỏi cả:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - một ngữ cảnh bảo mật (secure context)
>
> `http://localhost` dùng được để thử nghiệm cục bộ vì trình duyệt coi loopback là đáng tin cậy. `http://192.168.x.x` hoặc các IP LAN khác thường thì không, nên việc chuyển đổi Word/Excel/PowerPoint sẽ cần HTTPS khi truy cập từ các thiết bị khác trong mạng của bạn.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF có hai bản build: **bản Tự lưu trữ** (`bentopdf-simple`, dùng ở trên) cho triển khai nội bộ/nhóm/tổ chức, và **bản Thương mại** (`bentopdf:latest`) được chính bentopdf.com và các chủ sở hữu giấy phép thương mại dùng cho triển khai công khai. Cả hai đều có cùng các công cụ PDF, bản Thương mại bổ sung phần hero, FAQ, lời chứng thực và chân trang của bentopdf.com. Nếu không chắc, hãy dùng bản Tự lưu trữ.

Sau đó mở `http://localhost:3000` trong trình duyệt của bạn.

> [!NOTE]
> Nếu bạn chuẩn bị triển khai OCR trong môi trường air-gapped, bạn phải lưu trữ nội bộ cả các phông chữ lớp văn bản OCR, ngoài tệp worker Tesseract, runtime lõi và các tệp traineddata. Cách thiết lập đầy đủ có trong [Tự lưu trữ](/vi/self-hosting/), gồm `VITE_OCR_FONT_BASE_URL` và thư mục `ocr-fonts/` đi kèm.

### Cách 3: Build từ mã nguồn

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Tính năng nổi bật

| Danh mục                  | Công cụ                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| **Chuyển sang PDF**       | Word, Excel, PowerPoint, Hình ảnh, Markdown, EPUB, MOBI, và hơn nữa |
| **Chuyển từ PDF**         | JPG, PNG, Văn bản, Excel, SVG, và hơn nữa                           |
| **Chỉnh sửa & Chú thích** | Ký, Đánh dấu, Che thông tin, Điền biểu mẫu, Thêm con dấu            |
| **Sắp xếp**               | Gộp, Chia, Xoay, Xóa trang, Sắp xếp lại                             |
| **Tối ưu hóa**            | Nén, Sửa chữa, Làm phẳng, OCR                                       |
| **Bảo mật**               | Mã hóa, Giải mã, Gỡ hạn chế                                         |

## Hỗ trợ trình duyệt

BentoPDF hoạt động tốt nhất trên các trình duyệt hiện đại:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Bước tiếp theo

- [Khám phá tất cả công cụ](/vi/tools/)
- [Tự lưu trữ BentoPDF](/vi/self-hosting/)
- [Đóng góp cho dự án](/vi/contributing)
