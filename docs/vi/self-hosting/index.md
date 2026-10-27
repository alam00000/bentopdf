# Hướng dẫn tự lưu trữ

BentoPDF có thể được tự lưu trữ trên hạ tầng của riêng bạn. Hướng dẫn này trình bày nhiều tùy chọn triển khai.

## Bắt đầu nhanh với Docker / Podman

Cách nhanh nhất để tự lưu trữ BentoPDF:

> [!TIP]
> BentoPDF có hai bản dựng:
>
> - **Bản dựng Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Có mọi công cụ PDF, **không** có phần giao diện tiếp thị (không có hero, FAQ, lời chứng thực, chân trang). Dùng bản này cho các triển khai nội bộ, theo nhóm hoặc tổ chức. Đây **không phải** là phiên bản "lite" bị giảm tính năng.
> - **Bản dựng Commercial**: `ghcr.io/alam00000/bentopdf:latest`. Toàn bộ trang tiếp thị, được chính bentopdf.com và các chủ sở hữu giấy phép thương mại chạy triển khai công khai sử dụng.
>
> Nếu còn phân vân: hãy dùng bản dựng Self-Hosted.

> [!IMPORTANT]
> Chuyển đổi tệp Office cần `SharedArrayBuffer`, nghĩa là ứng dụng phải được cô lập cross-origin và phục vụ từ một ngữ cảnh bảo mật. Image chính thức đã gửi sẵn các header COOP/COEP cần thiết, nhưng trình duyệt vẫn tắt `SharedArrayBuffer` trên các origin HTTP mạng nội bộ như `http://192.168.x.x`.
>
> Chỉ dùng `http://localhost` để thử nghiệm trên cùng một thiết bị. Nếu người dùng truy cập BentoPDF qua IP hoặc tên máy trong mạng LAN, hãy dùng HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Hoặc với Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

Chạy BentoPDF như một dịch vụ systemd. Tạo `~/.config/containers/systemd/bentopdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Xem [hướng dẫn triển khai Docker](/vi/self-hosting/docker) để biết đầy đủ tài liệu về Quadlet.

## Dựng từ mã nguồn

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Tùy chọn cấu hình

### Bản dựng Self-Hosted (Simple Mode)

Bản dựng Self-Hosted (image `bentopdf-simple`, còn gọi là Simple Mode) **giống hệt về chức năng** với bản dựng Commercial: mọi công cụ PDF đều có và hoạt động như nhau. Nó chỉ ẩn phần giao diện tiếp thị vốn chỉ phù hợp với chính bentopdf.com hoặc một triển khai công khai thương mại. **Đây không phải là phiên bản bị giảm tính năng hay "lite".**

**Những gì bản dựng Self-Hosted ẩn đi** (chỉ là phần hiển thị, không có tính năng PDF nào bị gỡ bỏ):

- Thanh điều hướng, phần hero, phần tính năng, FAQ, lời chứng thực, chân trang
- Đổi tiêu đề trang thành "Công cụ PDF"

**Những gì bản dựng Self-Hosted giữ lại** (mọi thứ thực sự xử lý PDF):

- Mọi công cụ PDF (gộp, tách, chỉnh sửa, ký, OCR, chuyển đổi Office, v.v.)
- Hỗ trợ thương hiệu tùy chỉnh, toàn bộ cấu hình lúc dựng và lúc chạy

Bản dựng Commercial (`ghcr.io/alam00000/bentopdf:latest`) là bản vận hành chính bentopdf.com và được các chủ sở hữu giấy phép thương mại chạy triển khai công khai sử dụng. Nó bổ sung hero, FAQ, lời chứng thực và chân trang, những thứ không phù hợp với một công cụ nội bộ.

Nếu bạn tự lưu trữ BentoPDF cho nhóm, tổ chức hoặc làm công cụ nội bộ, hãy dùng bản dựng Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Xem [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) để biết chi tiết.

### Bản dựng Commercial (triển khai công khai với thương hiệu riêng)

Bản dựng Commercial (image `bentopdf`, không có hậu tố `-simple`) là bản vận hành chính bentopdf.com. Nó gồm toàn bộ trang tiếp thị (hero, tính năng, FAQ, lời chứng thực, chân trang) cùng mọi công cụ PDF. Hãy dùng bản dựng này khi bạn muốn **triển khai BentoPDF thành dịch vụ PDF công khai dưới thương hiệu của riêng bạn**, ví dụ:

- Bạn chạy BentoPDF như một SaaS cho người dùng cuối trên tên miền của riêng bạn
- Bạn muốn có trải nghiệm trang chủ (phần tiếp thị cùng công cụ), không chỉ giao diện công cụ trơn
- Bạn là chủ sở hữu giấy phép thương mại và nhúng BentoPDF vào một sản phẩm thương mại

**Chạy nguyên bản** (thương hiệu BentoPDF, hữu ích để xem trước bản dựng):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Dựng với thương hiệu riêng** (quy trình thương mại điển hình):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Mọi tùy chọn lúc dựng khác (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, ghi đè URL WASM, v.v.) hoạt động giống như trên bản dựng Self-Hosted.

::: warning Giấy phép
Chạy bản dựng Commercial được phép theo một trong hai tùy chọn giấy phép của BentoPDF:

- **AGPL-3.0** (miễn phí): được phép nếu triển khai của bạn công bố toàn bộ mã nguồn theo AGPL, bao gồm mọi chỉnh sửa thương hiệu và logic nghiệp vụ liên quan.
- **Giấy phép thương mại** ($79 trọn đời): bắt buộc cho các triển khai mã nguồn đóng / độc quyền, nơi bạn không mở mã nguồn của bản fork thương hiệu hay mã nghiệp vụ.

Xem [trang Giấy phép](https://www.bentopdf.com/licensing) để so sánh đầy đủ. Các mô-đun WASM theo giấy phép AGPL (PyMuPDF, Ghostscript, CoherentPDF) được tải từ CDN lúc chạy, nên chúng không nằm trong image của bạn và không thay đổi tình trạng giấy phép của bạn.
:::

### Base URL

Triển khai vào một thư mục con:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Thương hiệu tùy chỉnh

Thay logo, tên và văn bản chân trang mặc định của BentoPDF bằng của bạn ngay lúc dựng:

| Variable           | Mô tả                                        | Mặc định                                |
| ------------------ | -------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Tên thương hiệu hiển thị ở đầu và chân trang | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Đường dẫn logo, tính từ `public/`            | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Văn bản chân trang / bản quyền tùy chỉnh     | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Hoặc qua Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Thương hiệu hoạt động ở cả chế độ đầy đủ lẫn Simple Mode, và có thể kết hợp với mọi tùy chọn lúc dựng khác (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Tắt công cụ cụ thể

Ẩn từng công cụ vì lý do tuân thủ hoặc bảo mật. Công cụ bị tắt sẽ bị loại khỏi trang chủ, tìm kiếm, phím tắt, trình tạo quy trình và truy cập trực tiếp bằng URL.

ID công cụ là URL của trang bỏ đi `.html`. Hãy mở bất kỳ công cụ nào và xem URL (ví dụ: `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Lúc dựng** (được đưa thẳng vào bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Lúc chạy** (không cần dựng lại, gắn một tệp `config.json`):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Có thể kết hợp cả hai cách, các danh sách sẽ được gộp lại.

Bạn cũng có thể tắt một số tính năng bên trong Trình chỉnh sửa PDF (ví dụ: biên tập che thông tin) mà không cần tắt cả công cụ, bằng cách thêm `editorDisabledCategories` vào `config.json`. Xem [hướng dẫn Docker](/vi/self-hosting/docker#tat-tinh-nang-cua-trinh-chinh-sua) để biết danh sách đầy đủ các nhóm.

## Hướng dẫn triển khai

Chọn nền tảng của bạn:

- [Vercel](/vi/self-hosting/vercel)
- [Netlify](/vi/self-hosting/netlify)
- [Cloudflare Pages](/vi/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/vi/self-hosting/aws)
- [Hostinger](/vi/self-hosting/hostinger)
- [Nginx](/vi/self-hosting/nginx)
- [Apache](/vi/self-hosting/apache)
- [Docker](/vi/self-hosting/docker)
- [Kubernetes](/vi/self-hosting/kubernetes)
- [CORS Proxy](/vi/self-hosting/cors-proxy) - Bắt buộc cho chữ ký số

## Các sự cố thường gặp

### Chuyển Word / ODT / Excel / PowerPoint sang PDF bị treo (SharedArrayBuffer không khả dụng)

**Triệu chứng**: Các chuyển đổi tài liệu dựa trên LibreOffice (Word, ODT, Excel, PowerPoint sang PDF) bị treo ở khoảng 55% hoặc không thể bắt đầu. Bảng điều khiển trình duyệt có thể hiển thị:

> `ReferenceError: SharedArrayBuffer is not defined`

...hoặc `window.crossOriginIsolated` trả về `false`, hoặc quá trình biên dịch WASM báo `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Nguyên nhân**: LibreOffice WASM cần `SharedArrayBuffer`, thứ mà trình duyệt chỉ bật khi trang được **cô lập cross-origin** VÀ được phục vụ từ một **ngữ cảnh bảo mật**. Điều đó nghĩa là cần đảm bảo hai điều:

1. Mọi phản hồi đều có cả hai header:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Trang được phục vụ từ `https://...` hoặc `http://localhost`. HTTP thường trên IP mạng LAN (ví dụ `http://192.168.x.x`) KHÔNG được coi là bảo mật: trình duyệt tắt `SharedArrayBuffer` ở đó.

Việc lệch `00 61 73 6d / 1f 8b 08 08` là một triệu chứng phụ riêng: các tệp `.wasm.gz` / `.data.gz` đã nén sẵn thiếu header phản hồi `Content-Encoding: gzip`, nên trình duyệt nhận dữ liệu gzip thô thay vì WASM đã giải nén.

**Cách khắc phục**: xem hướng dẫn triển khai riêng của nền tảng bạn để biết cấu hình chính xác:

- [Nginx →](/vi/self-hosting/nginx#chuyen-word-odt-excel-sang-pdf-khong-hoat-đong)
- [Apache →](/vi/self-hosting/apache#chuyen-word-odt-excel-sang-pdf-khong-hoat-đong)
- [AWS S3 + CloudFront →](/vi/self-hosting/aws#buoc-3b-chinh-sach-header-phan-hoi-bat-buoc-cho-libreoffice-wasm)
- [Cloudflare Pages →](/vi/self-hosting/cloudflare#tep-cau-hinh) (tệp `_headers`)
- [Netlify →](/vi/self-hosting/netlify#chuyen-word-odt-excel-sang-pdf-bi-đung-o-55) (`netlify.toml`)
- [Vercel →](/vi/self-hosting/vercel#chuyen-word-odt-excel-sang-pdf-khong-hoat-đong) (`vercel.json`)
- [Hostinger →](/vi/self-hosting/hostinger#cong-cu-libreoffice-khong-hoat-đong) (`.htaccess`)
- [Kubernetes →](/vi/self-hosting/kubernetes#đam-bao-cac-header-sharedarraybuffer-van-hoat-đong-ingress-gateway)
- **Docker**: được xử lý tự động bởi cấu hình nginx đi kèm, không cần làm gì thêm.

**Kiểm tra**: mở Console của DevTools trên bất kỳ trang BentoPDF nào và chạy:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Nếu trang dùng HTTPS hoặc `http://localhost` VÀ cả hai header COEP/COOP đều có trên mọi phản hồi, cả hai phép kiểm tra sẽ đạt. Nếu bạn đang dùng `http://192.168.x.x` hoặc một origin HTTP không phải loopback khác, hãy dùng HTTPS: không có cách khắc phục nào chỉ bằng header.

### Tệp `.mjs` được phục vụ với `application/octet-stream`

**Triệu chứng**: Ký PDF / Form Filler / một số công cụ khác hiển thị trình xem trống hoặc không tải được. Bảng điều khiển trình duyệt báo:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Nguyên nhân**: Máy chủ web hoặc reverse proxy của bạn không có ánh xạ kiểu MIME cho tệp `.mjs` (trình xem PDF đi kèm dùng module ES với phần mở rộng này). Nhiều cấu hình máy chủ mặc định dùng `application/octet-stream` cho các phần mở rộng không nhận ra, và trình duyệt từ chối thực thi chúng như module ES.

**Cách khắc phục**: xem hướng dẫn triển khai riêng của nền tảng bạn để biết đoạn cấu hình chính xác:

- [Nginx →](/vi/self-hosting/nginx#ky-pdf-hoac-form-filler-hien-thi-trinh-xem-trong-loi-mime-mjs)
- [Apache →](/vi/self-hosting/apache#ky-pdf-hoac-form-filler-hien-thi-trinh-xem-trong-loi-mime-mjs)
- [AWS S3 + CloudFront →](/vi/self-hosting/aws#buoc-2-build-va-tai-len) (xem `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/vi/self-hosting/kubernetes#loi-kieu-mime-cua-mjs-ky-pdf-iframe-form-filler-bi-trong)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: được xử lý tự động, không cần làm gì thêm.

**Kiểm tra**: mở DevTools → tab Network, tìm yêu cầu `.mjs` bị lỗi, xem header phản hồi `Content-Type`. Giá trị phải là `application/javascript`. Nếu vẫn là `application/octet-stream`, có thể một reverse proxy hoặc CDN bên ngoài đang tự đoán lại kiểu: hãy kiểm tra từng lớp trong chuỗi phục vụ của bạn.

## Cấu hình WASM (thành phần AGPL)

BentoPDF **không đóng gói** các thư viện xử lý theo giấy phép AGPL trong mã nguồn của mình, nhưng **cấu hình sẵn các URL CDN** để mọi tính năng hoạt động ngay, không cần thiết lập thủ công.

::: tip Không cần cấu hình theo mặc định
Từ v2.0.0, các mô-đun WASM được cấu hình sẵn để tải từ CDN jsDelivr thông qua biến môi trường. Mọi tính năng nâng cao hoạt động ngay mà người dùng không cần cấu hình gì.
:::

| Thành phần      | Giấy phép | Tính năng                                                     |
| --------------- | --------- | ------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0  | Chuyển đổi EPUB/MOBI/FB2/XPS, trích xuất ảnh, trích xuất bảng |
| **Ghostscript** | AGPL-3.0  | Chuyển đổi PDF/A, nén, chỉnh nghiêng, rasterize               |
| **CoherentPDF** | AGPL-3.0  | Mục lục, tệp đính kèm, gộp PDF kèm dấu trang                  |

### Biến môi trường mặc định

Các biến này được đặt trong `.env.production` và đưa thẳng vào bản dựng:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### Ghi đè URL WASM

Bạn có thể ghi đè các giá trị mặc định lúc dựng cho các triển khai tùy chỉnh:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

Để tắt hoàn toàn một mô-đun (yêu cầu người dùng tự cấu hình qua Cài đặt nâng cao), hãy đặt biến của nó thành chuỗi rỗng.

Với OCR, hoặc để trống tất cả biến `VITE_TESSERACT_*` và dùng các tài nguyên trực tuyến mặc định, hoặc đặt đồng thời các URL worker/core/lang cho OCR tự lưu trữ / ngoại tuyến. Nếu bạn chỉ đóng gói một số ngôn ngữ OCR, hãy đặt thêm `VITE_TESSERACT_AVAILABLE_LANGUAGES` với cùng các mã phân tách bằng dấu phẩy để giao diện chỉ đưa ra các ngôn ngữ đã cài và các lựa chọn không được hỗ trợ báo lỗi mô tả rõ ràng. Để xuất PDF có thể tìm kiếm hoàn toàn ngoại tuyến, hãy đặt thêm `VITE_OCR_FONT_BASE_URL` trỏ đến thư mục nội bộ phục vụ các phông chữ OCR đi kèm.

Người dùng cũng có thể ghi đè các giá trị mặc định này bất cứ lúc nào qua **Cài đặt nâng cao** trong giao diện: các ghi đè của người dùng lưu trong trình duyệt được ưu tiên hơn giá trị mặc định của môi trường.

### Triển khai cách ly mạng / ngoại tuyến

Dành cho các mạng không có internet (chính phủ, y tế, tài chính, v.v.). Các URL WASM được đưa thẳng vào JavaScript **lúc dựng**, còn các tệp WASM thực tế được **trình duyệt của người dùng** tải về lúc chạy. Vì vậy bạn cần chuẩn bị mọi thứ trên một máy có internet rồi chuyển vào mạng cách ly.

#### Script tự động (khuyến nghị)

Script `prepare-airgap.sh` đi kèm tự động hóa toàn bộ quy trình: tải các gói WASM, dựng image Docker và tạo một bundle độc lập cùng script thiết lập.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

Lệnh này tạo ra một thư mục bundle:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Chuyển bundle vào mạng cách ly qua USB, kho artifact nội bộ hoặc phương thức được phê duyệt. Sau đó chạy script thiết lập đi kèm:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Script thiết lập sẽ nạp image Docker, giải nén các tệp WASM và tùy chọn khởi động container.

**Tùy chọn của script:**

| Flag                           | Mô tả                                                  | Mặc định                       |
| ------------------------------ | ------------------------------------------------------ | ------------------------------ |
| `--wasm-base-url <url>`        | Nơi các WASM sẽ được lưu trữ nội bộ                    | _(bắt buộc, sẽ hỏi nếu thiếu)_ |
| `--image-name <name>`          | Tag image Docker                                       | `bentopdf`                     |
| `--output-dir <path>`          | Thư mục bundle đầu ra                                  | `./bentopdf-airgap-bundle`     |
| `--simple-mode`                | Bật Simple Mode                                        | tắt                            |
| `--base-url <path>`            | URL gốc của thư mục con (ví dụ `/pdf/`)                | `/`                            |
| `--language <code>`            | Ngôn ngữ giao diện mặc định (ví dụ `fr`, `de`)         | _(không có)_                   |
| `--brand-name <name>`          | Tên thương hiệu tùy chỉnh                              | _(không có)_                   |
| `--brand-logo <path>`          | Đường dẫn logo, tính từ `public/`                      | _(không có)_                   |
| `--footer-text <text>`         | Văn bản chân trang tùy chỉnh                           | _(không có)_                   |
| `--ocr-languages <list>`       | Các ngôn ngữ OCR cần đóng gói, phân tách bằng dấu phẩy | `eng`                          |
| `--list-ocr-languages`         | In các mã và tên OCR được hỗ trợ rồi thoát             | tắt                            |
| `--search-ocr-language <term>` | Tìm mã OCR theo tên hoặc chữ viết tắt                  | tắt                            |
| `--dockerfile <path>`          | Dockerfile cần dùng                                    | `Dockerfile`                   |
| `--skip-docker`                | Bỏ qua bước dựng và xuất Docker                        | tắt                            |
| `--skip-wasm`                  | Bỏ qua tải WASM (dùng lại các tệp `.tgz` có sẵn)       | tắt                            |

Lời nhắc tương tác cũng chấp nhận `list` để in toàn bộ danh sách mã Tesseract được hỗ trợ và `search <term>` để tìm kết quả khớp như `search german` hoặc `search chi`.

::: warning Yêu cầu cùng origin
Các tệp WASM phải được phục vụ từ **cùng origin** với ứng dụng BentoPDF. Web Worker dùng `importScripts()` và không thể tải script cross-origin. Ví dụ, nếu BentoPDF chạy tại `https://internal.example.com`, URL gốc của WASM cũng nên là `https://internal.example.com/wasm`.
:::

#### Các bước thủ công

<details>
<summary>Nếu bạn muốn làm thủ công mà không dùng script</summary>

**Bước 1: Tải các gói WASM và OCR** (trên máy có internet)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**Bước 2: Dựng image Docker với các URL nội bộ**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**Bước 3: Xuất image Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Bước 4: Chuyển vào mạng cách ly**

Sao chép qua USB, kho artifact nội bộ hoặc phương thức chuyển được phê duyệt:

- `bentopdf.tar`: image Docker
- Năm gói WASM/OCR `.tgz` từ Bước 1
- Thư mục `tesseract-langdata/` từ Bước 1
- Thư mục `ocr-fonts/` từ Bước 1

**Bước 5: Thiết lập bên trong mạng cách ly**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Hãy đảm bảo các tệp truy cập được tại các URL bạn đã cấu hình ở Bước 2, gồm `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` và `.../ocr/fonts`.

</details>

::: info Dựng từ mã nguồn thay vì Docker?
Đặt các biến trong `.env.production` trước khi chạy `npm run build`:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### Tự lưu trữ WASM Proxy

Nếu bạn cần phục vụ các tệp WASM AGPL với header CORS phù hợp, bạn có thể triển khai một proxy đơn giản. Xem [hướng dẫn Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) để có ví dụ triển khai.

::: tip Tại sao tách riêng?
Việc tách riêng này đảm bảo:

- Tuân thủ pháp lý rõ ràng cho người dùng thương mại
- Phần lõi của BentoPDF vẫn nằm dưới giấy phép kép (AGPL-3.0 / Commercial)
- Các tệp WASM được tải lúc chạy, không đóng gói trong mã nguồn
  :::

## Yêu cầu hệ thống

| Yêu cầu | Tối thiểu                                 |
| ------- | ----------------------------------------- |
| Lưu trữ | ~100 MB (phần lõi, không gồm mô-đun AGPL) |
| RAM     | 512 MB                                    |
| CPU     | Bất kỳ bộ xử lý hiện đại nào              |

::: tip
BentoPDF là một trang web tĩnh, không cần cơ sở dữ liệu hay máy chủ backend!
:::
