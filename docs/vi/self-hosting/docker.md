# Triển khai với Docker / Podman

Cách dễ nhất để tự lưu trữ BentoPDF trong môi trường production.

> [!IMPORTANT]
> **Các header bắt buộc cho chuyển đổi tệp Office**
>
> Các công cụ dựa trên LibreOffice (chuyển đổi Word, Excel, PowerPoint) cần các header HTTP sau để hỗ trợ `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Trang cũng phải được phục vụ từ một ngữ cảnh bảo mật (secure context). `http://localhost` dùng được để thử nghiệm cục bộ, nhưng `http://192.168.x.x` hoặc các IP LAN khác thường không đạt điều kiện, nên chuyển đổi Office qua HTTP thường sẽ thất bại dù các header đã có.
>
> Các container image chính thức đã bao gồm những header này. Nếu dùng reverse proxy (Traefik, Caddy, v.v.), hãy đảm bảo các header được giữ nguyên hoặc được thêm vào, và dùng HTTPS khi truy cập không qua loopback.

> [!TIP]
> **Người dùng Podman:** Mọi lệnh `docker` đều chạy được với Podman bằng cách thay `docker` bằng `podman` và `docker-compose` bằng `podman-compose`.

## Bắt đầu nhanh

> [!TIP]
> BentoPDF có hai bản build:
>
> - **Bản Tự lưu trữ** - `ghcr.io/alam00000/bentopdf-simple:latest`. Có mọi công cụ PDF, **không** có phần giao diện quảng bá (không hero, FAQ, lời chứng thực, chân trang). Dùng cho triển khai nội bộ/nhóm/tổ chức. Đây **không** phải bản "lite" bị giảm tính năng.
> - **Bản Thương mại** - `ghcr.io/alam00000/bentopdf:latest`. Toàn bộ trang quảng bá, được chính bentopdf.com và các chủ sở hữu giấy phép thương mại dùng cho triển khai công khai.
>
> Nếu không chắc: hãy pull bản Tự lưu trữ.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

Tạo `docker-compose.yml`:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

Chạy:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Tự build image

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Build và chạy:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Biến môi trường

| Biến                                 | Mô tả                                                                                                                                                                                     | Mặc định                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Build biến thể Tự lưu trữ (ẩn phần giao diện quảng bá của bentopdf.com: hero, FAQ, lời chứng thực, chân trang). Mọi công cụ PDF vẫn còn.                                                  | `false`                                                        |
| `BASE_URL`                           | Triển khai vào thư mục con                                                                                                                                                                | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL module WASM PyMuPDF                                                                                                                                                                   | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL module WASM Ghostscript                                                                                                                                                               | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL module WASM CoherentPDF                                                                                                                                                               | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL tệp script worker OCR                                                                                                                                                                 | _(trống; dùng CDN mặc định của Tesseract.js)_                  |
| `VITE_TESSERACT_CORE_URL`            | Thư mục runtime lõi OCR                                                                                                                                                                   | _(trống; dùng CDN mặc định của Tesseract.js)_                  |
| `VITE_TESSERACT_LANG_URL`            | Thư mục traineddata OCR                                                                                                                                                                   | _(trống; dùng CDN mặc định của Tesseract.js)_                  |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Các ngôn ngữ OCR hiển thị trong giao diện, phân tách bằng dấu phẩy                                                                                                                        | _(trống; hiển thị toàn bộ danh mục)_                           |
| `VITE_OCR_FONT_BASE_URL`             | Thư mục phông chữ lớp văn bản OCR                                                                                                                                                         | _(trống; dùng URL phông Noto từ xa)_                           |
| `VITE_DEFAULT_LANGUAGE`              | Ngôn ngữ giao diện mặc định                                                                                                                                                               | `en`                                                           |
| `VITE_BRAND_NAME`                    | Tên thương hiệu tùy chỉnh                                                                                                                                                                 | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Đường dẫn logo tương đối so với `public/`                                                                                                                                                 | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Văn bản chân trang/bản quyền tùy chỉnh                                                                                                                                                    | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID các công cụ cần ẩn, phân tách bằng dấu phẩy                                                                                                                                            | _(trống; bật mọi công cụ)_                                     |
| `DISABLE_GITHUB_STARS`               | Bỏ qua việc lấy số sao GitHub khi tải trang và loại `api.github.com` khỏi CSP. Các bản build Simple Mode luôn bỏ qua.                                                                     | `false`                                                        |
| `SITE_URL`                           | URL công khai được ghi vào các liên kết canonical, hreflang và sitemap. Hãy giữ mặc định trừ khi bạn muốn công cụ tìm kiếm coi bản triển khai của bạn là một trang riêng.                 | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Với `SITE_URL` tùy chỉnh, mọi trang được đánh dấu `noindex` để bản của bạn không cạnh tranh với bentopdf.com trong kết quả tìm kiếm. Đặt `true` để cho phép công cụ tìm kiếm lập chỉ mục. | `false`                                                        |

URL các module WASM đã được cấu hình sẵn với CDN mặc định, nên mọi tính năng nâng cao hoạt động ngay. Hãy ghi đè các URL này cho môi trường air-gapped hoặc tự lưu trữ.

### Công cụ tìm kiếm

Theo mặc định, mọi trang đều chỉ công cụ tìm kiếm về bentopdf.com như bản gốc, nên bản triển khai của bạn không bị coi là trùng lặp. Bạn không cần thay đổi gì cho một bản riêng tư hoặc nội bộ.

- **Giữ bản của bạn hoàn toàn ngoài kết quả tìm kiếm:** chạy container với `-e ROBOTS_NOINDEX=true`. Chỉ cần khởi động lại, không cần build lại.
- **Biến bản của bạn thành một trang riêng trong kết quả tìm kiếm:** build với `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Nếu thiếu `ALLOW_INDEXING=true`, `SITE_URL` tùy chỉnh sẽ đánh dấu mọi trang là `noindex`.

### Content-Security-Policy

Image nginx đi kèm header `Content-Security-Policy` ở chế độ thực thi. Các chỉ thị `script-src`, `connect-src` và `font-src` của CSP được **tạo tại thời điểm build** từ các biến URL `VITE_*` ở trên: mọi host bạn truyền qua `--build-arg` đều tự động được thêm vào chính sách.

Do đó:

- Nếu bạn ghi đè `VITE_CORS_PROXY_URL` hoặc `VITE_WASM_*_URL` lúc build, CSP tự động cho phép các origin đó, không cần cấu hình thêm.
- Với URL trên `cdn.jsdelivr.net`, `script-src` chỉ cho phép đúng thư mục gói có phiên bản, ví dụ `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, không phải toàn bộ CDN. jsDelivr phục vụ bất kỳ gói npm hoặc kho GitHub công khai nào, nên cho phép cả host sẽ để chúng chạy trên bản triển khai của bạn. URL trên mọi host khác được cho phép theo origin.
- Nếu bạn cấu hình URL WASM tùy chỉnh lúc _chạy_ qua trang Cài đặt nâng cao trong ứng dụng, các origin đó **không** có trong CSP và trình duyệt sẽ chặn các yêu cầu tới chúng. Điều này cũng áp dụng cho phiên bản khác của cùng một gói trên `cdn.jsdelivr.net`, vì chỉ phiên bản đặt lúc build được cho phép. Cấu hình lúc chạy dành cho thử nghiệm; với URL tùy chỉnh lâu dài, hãy đặt build arg `VITE_*` tương ứng.
- Các bản triển khai air-gapped ghi đè cả ba giá trị `VITE_WASM_*_URL` cũng sẽ bị loại các thư mục gói `cdn.jsdelivr.net` đó khỏi CSP (mỗi giá trị mặc định được thay thế, không phải nối thêm). Các mặc định Tesseract OCR trên `cdn.jsdelivr.net` vẫn nằm trong chính sách cho đến khi bạn cũng đặt ba giá trị `VITE_TESSERACT_*`. Tương tự, đặt `VITE_CORS_PROXY_URL` sẽ thay thế mặc định công khai `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP có `'unsafe-eval'` trong `script-src` vì runtime LibreOffice WASM (dùng cho các công cụ chuyển đổi Word/Excel/PowerPoint) và thư viện ảnh wasm-vips (dùng cho PDF sang TIFF) biên dịch mã điều phối nội bộ qua `new Function()`. Gỡ nó sẽ làm hỏng các công cụ này. Nếu bạn build ở `SIMPLE_MODE` (không có LibreOffice) và không cần PDF sang TIFF, bạn có thể tự sửa tệp `security-headers.conf` được tạo ra để bỏ `'unsafe-eval'` cho chính sách chặt hơn.

Với OCR, hãy để trống các biến `VITE_TESSERACT_*` để dùng tài nguyên trực tuyến mặc định, hoặc đặt cả ba cùng lúc cho OCR tự lưu trữ/ngoại tuyến. Ghi đè OCR một phần sẽ bị từ chối vì worker, runtime lõi và thư mục traineddata phải khớp nhau. Để có đầu ra PDF có thể tìm kiếm hoàn toàn ngoại tuyến, hãy đặt thêm `VITE_OCR_FONT_BASE_URL` để phông chữ lớp văn bản OCR được tải từ máy chủ nội bộ của bạn thay vì URL phông Noto công khai.

`VITE_DEFAULT_LANGUAGE` đặt ngôn ngữ giao diện cho khách truy cập lần đầu. Giá trị được hỗ trợ: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Người dùng vẫn có thể đổi ngôn ngữ, giá trị này chỉ đổi mặc định.

Ví dụ:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Thương hiệu tùy chỉnh

Thay logo, tên và văn bản chân trang BentoPDF mặc định bằng của riêng bạn. Đặt tệp logo vào thư mục `public/` (hoặc dùng một ảnh có sẵn), sau đó truyền các biến thương hiệu lúc build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Thương hiệu hoạt động ở cả chế độ đầy đủ và Simple Mode, và có thể kết hợp với mọi tùy chọn build khác.

### Tắt một số công cụ

Ẩn công cụ khỏi giao diện để đáp ứng yêu cầu tuân thủ hoặc bảo mật. Các công cụ bị tắt sẽ bị gỡ khỏi trang chủ, kết quả tìm kiếm, phím tắt và trình tạo quy trình. Truy cập trực tiếp bằng URL sẽ hiển thị trang "công cụ không khả dụng".

ID công cụ là URL của trang bỏ `.html`. Ví dụ, nếu công cụ nằm ở `bentopdf.com/edit-pdf.html`, ID là `edit-pdf`.

#### Tìm ID công cụ

Cách dễ nhất: mở bất kỳ công cụ nào trong BentoPDF và nhìn vào URL. Phần cuối của đường dẫn (bỏ `.html`) chính là ID công cụ.

<details>
<summary>Danh sách đầy đủ ID công cụ</summary>

**Chỉnh sửa & Chú thích:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Chuyển sang PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Chuyển từ PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Sắp xếp & Quản lý:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Tối ưu hóa & Sửa chữa:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Bảo mật:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Cách 1: Lúc build (build arg của Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Cách này ghi danh sách công cụ bị tắt vào bundle JavaScript. Cần build lại để thay đổi.

#### Cách 2: Lúc chạy (config.json)

Gắn một tệp `config.json` vào thư mục được phục vụ, không cần build lại:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Hoặc với Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Có thể kết hợp cả hai cách, các danh sách sẽ được gộp. Nếu một công cụ xuất hiện ở một trong hai, nó sẽ bị tắt.

#### Tắt tính năng của trình chỉnh sửa

Bạn cũng có thể tắt các tính năng cụ thể trong Trình chỉnh sửa PDF (ví dụ che thông tin, chú thích, biểu mẫu) mà không cần tắt cả công cụ chỉnh sửa. Thêm `editorDisabledCategories` vào `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Danh sách đầy đủ danh mục của trình chỉnh sửa</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Chú thích:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Hình dạng:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Biểu mẫu:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Che thông tin:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Tài liệu:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Trang:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Bảng điều khiển:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Công cụ:** `tools`, `pan`, `pointer`, `capture`

**Lựa chọn:** `selection`, `selection-copy`

**Lịch sử:** `history`, `history-undo`, `history-redo`

</details>

Các danh mục có cấu trúc phân cấp: tắt một mục cha (ví dụ `annotation`) sẽ tắt toàn bộ mục con của nó.

### Tắt bộ đếm sao GitHub

Thanh điều hướng hiển thị số sao GitHub trực tiếp, được lấy từ `api.github.com` khi tải trang. Đây là yêu cầu bên ngoài duy nhất không phục vụ một tính năng PDF. Hãy tắt nó lúc build để gỡ mã lấy dữ liệu khỏi bundle và loại `api.github.com` khỏi Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Các bản build Simple Mode (`bentopdf-simple`) luôn bỏ qua bộ đếm sao, cờ này chỉ cần cho bản Thương mại hoặc các bản build đầy đủ tùy chỉnh.

### URL WASM tùy chỉnh (Air-Gapped / Tự lưu trữ)

> [!IMPORTANT]
> URL WASM được ghi vào JavaScript lúc **build**. Các tệp WASM được **trình duyệt của người dùng** tải về lúc chạy, Docker không tải chúng trong quá trình build. Với mạng air-gapped, bạn phải lưu trữ các tệp WASM trên một máy chủ nội bộ mà trình duyệt truy cập được.

**Quy trình air-gapped đầy đủ:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Dùng các mã được in bởi `bash scripts/prepare-airgap.sh --list-ocr-languages`, hoặc tìm theo tên bằng `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, cho `--ocr-languages`. Khi build với một tập con OCR giới hạn, hãy truyền cùng các mã đó cho `VITE_TESSERACT_AVAILABLE_LANGUAGES` để ứng dụng chỉ hiển thị các ngôn ngữ đã đóng gói. Để có đầu ra OCR ngoại tuyến đầy đủ, hãy lưu trữ thêm thư mục `ocr-fonts/` đi kèm và trỏ `VITE_OCR_FONT_BASE_URL` tới nó.

Đặt một biến thành chuỗi rỗng để tắt module đó (người dùng phải tự cấu hình qua Cài đặt nâng cao).

## Cổng tùy chỉnh

Theo mặc định, BentoPDF lắng nghe ở cổng `8080` bên trong container. Để đổi, hãy đặt biến môi trường `PORT` lúc chạy:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Biến   | Mô tả                                | Mặc định |
| ------ | ------------------------------------ | -------- |
| `PORT` | Cổng lắng nghe Nginx trong container | `8080`   |

Cách này hoạt động với cả Dockerfile tiêu chuẩn và nonroot.

## User ID tùy chỉnh (PUID/PGID)

Với các môi trường yêu cầu chạy bằng một người dùng không phải root cụ thể (thiết bị NAS, Kubernetes có security context, chính sách của tổ chức), BentoPDF cung cấp một Dockerfile riêng hỗ trợ PUID/PGID kiểu LSIO.

### Build và chạy

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### Biến môi trường

| Biến           | Mô tả                | Mặc định |
| -------------- | -------------------- | -------- |
| `PUID`         | User ID để chạy      | `1000`   |
| `PGID`         | Group ID để chạy     | `1000`   |
| `PORT`         | Cổng lắng nghe Nginx | `8080`   |
| `DISABLE_IPV6` | Tắt listener IPv6    | `false`  |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### Cách hoạt động

Container khởi động bằng root, tạo một người dùng với PUID/PGID đã chỉ định, điều chỉnh quyền sở hữu trên mọi thư mục có thể ghi, rồi hạ quyền bằng `su-exec`. Tiến trình nginx chạy hoàn toàn dưới người dùng bạn chỉ định.

> [!NOTE]
> `Dockerfile` tiêu chuẩn dùng `nginx-unprivileged` (UID 101) và được khuyến nghị cho hầu hết triển khai. Chỉ dùng `Dockerfile.nonroot` khi bạn cần một UID/GID cụ thể.

> [!WARNING]
> PUID/PGID không được là `0` (root). Entrypoint kiểm tra đầu vào và sẽ thoát với lỗi nếu giá trị không hợp lệ.

## Với Traefik (Reverse Proxy)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Với Caddy (Reverse Proxy)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Giới hạn tài nguyên

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (tích hợp Systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) cho phép bạn chạy container Podman như các dịch vụ systemd. Rất phù hợp cho triển khai production trên hệ thống Linux.

### Thiết lập Quadlet cơ bản

Tạo tệp unit container tại `~/.config/containers/systemd/bentopdf.container` (người dùng) hoặc `/etc/containers/systemd/bentopdf.container` (hệ thống):

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Bật và khởi động

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> Với triển khai toàn hệ thống, dùng `systemctl` không kèm cờ `--user` và đặt tệp trong `/etc/containers/systemd/`.

### Quadlet với kiểm tra sức khỏe

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Tự động cập nhật với Quadlet

Podman có thể tự động cập nhật container khi có image mới:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Cấu hình mạng Quadlet

Để cấu hình mạng tùy chỉnh, tạo tệp mạng `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Sau đó tham chiếu nó trong tệp container của bạn:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Cập nhật

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
