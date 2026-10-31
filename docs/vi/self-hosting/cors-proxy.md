# CORS Proxy để lấy chứng chỉ

Công cụ chữ ký số dùng một CORS proxy để lấy các chứng chỉ của bên cấp phát từ các Tổ chức cấp chứng chỉ (CA) bên ngoài. Điều này cần thiết vì nhiều máy chủ CA không đưa header CORS vào phản hồi, khiến trình duyệt không thể lấy trực tiếp.

Ngoài ra, nhiều máy chủ CA phục vụ chứng chỉ qua HTTP thường. Khi BentoPDF của bạn chạy trên HTTPS, trình duyệt sẽ chặn các yêu cầu HTTP này (chính sách nội dung hỗn hợp). CORS proxy giải quyết cả hai vấn đề bằng cách chuyển yêu cầu qua một endpoint HTTPS với các header phù hợp.

## Cách hoạt động

Khi ký PDF bằng chứng chỉ:

1. Thư viện `zgapdfsigner` cố gắng dựng một chuỗi chứng chỉ hoàn chỉnh
2. Nó lấy các chứng chỉ của bên cấp phát từ các URL nhúng trong phần mở rộng AIA (Authority Information Access) của chứng chỉ bạn
3. Các yêu cầu này được chuyển qua một CORS proxy thêm các header `Access-Control-Allow-Origin` cần thiết
4. Proxy trả dữ liệu chứng chỉ về trình duyệt

## Tự lưu trữ CORS Proxy

Nếu bạn tự lưu trữ BentoPDF, bạn cần triển khai CORS proxy của riêng mình để chữ ký số hoạt động với các chứng chỉ cần lấy chuỗi chứng chỉ.

### Cách 1: Cloudflare Workers (khuyến nghị)

1. **Cài đặt Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Đăng nhập Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clone BentoPDF và cập nhật các origin được phép**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Mở `cors-proxy-worker.js` và đổi mảng `ALLOWED_ORIGINS` thành tên miền của bạn:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Quan trọng
   Nếu không thay đổi này, proxy sẽ từ chối mọi yêu cầu từ trang của bạn với lỗi **403 Forbidden**. Mặc định chỉ cho phép yêu cầu từ `bentopdf.com`.
   :::

4. **Triển khai proxy**:

   ```bash
   wrangler deploy
   ```

   Ghi lại URL worker của bạn (ví dụ `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Build lại BentoPDF với URL proxy**:

   Nếu dùng Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Nếu build từ mã nguồn:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Cách 2: Backend proxy tùy chỉnh

Bạn cũng có thể tự tạo endpoint proxy. Các yêu cầu là:

1. Chấp nhận yêu cầu GET với tham số truy vấn `url`
2. Lấy URL đó từ máy chủ của bạn (phía máy chủ không bị hạn chế CORS)
3. Trả phản hồi kèm các header sau:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Ví dụ triển khai bằng Express.js:

```javascript
app.get('/api/cert-proxy', async (req, res) => {
  const targetUrl = req.query.url;

  // Validate it's a certificate URL
  if (!isValidCertUrl(targetUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    res.set('Access-Control-Allow-Origin', 'https://your-domain.com');
    res.set('Content-Type', 'application/octet-stream');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

## Lưu ý bảo mật

Cloudflare Worker đi kèm có nhiều biện pháp bảo mật:

| Tính năng                   | Mô tả                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------- |
| **Xác thực origin**         | Chỉ cho phép yêu cầu từ các tên miền trong `ALLOWED_ORIGINS`                          |
| **Hạn chế URL**             | Chỉ cho phép URL chứng chỉ (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)       |
| **Chặn IP riêng**           | Chặn dải riêng IPv4/IPv6, link-local, loopback, IP dạng thập phân và metadata đám mây |
| **An toàn Content-Type**    | Chỉ trả về các MIME type chứng chỉ an toàn, chặn chèn content-type từ upstream        |
| **Giới hạn kích thước tệp** | Truyền phản hồi theo luồng với giới hạn 10MB, hủy giữa chừng nếu vượt quá             |
| **Giới hạn tốc độ**         | 60 yêu cầu mỗi phút cho mỗi IP hoặc IPv6 /64 (cần KV, bỏ qua giới hạn khi KV lỗi)     |
| **Chữ ký HMAC**             | Ký phía máy khách tùy chọn (ngăn chặn lạm dụng thông thường)                          |

### DNS rebinding (tự lưu trữ ngoài Cloudflare)

Worker từ chối mọi URL phân giải ra IP riêng hoặc nội bộ. Nó không thể dùng danh sách cho phép cố định các host, vì URL chuỗi chứng chỉ trỏ đến bất kỳ CA nào đã cấp chứng chỉ (FNMT, CA doanh nghiệp, v.v.), nên đích đến không biết trước. Điều đó để lại một khoảng hở rebinding nhỏ: người điều hành DNS cho tên miền của họ có thể đưa một IP công khai cho bước kiểm tra an toàn và một IP riêng cho yêu cầu thật ngay sau đó.

Trên Cloudflare điều này không khai thác được, vì Workers không thể truy cập IP riêng hay endpoint metadata `169.254.169.254`, nên rebind không dẫn đến đâu. Chỉ cần đừng cho worker thêm đường vào: đừng gắn Tunnel, Service hay binding mạng riêng (nó chỉ cần `RATE_LIMIT_KV`).

Nếu bạn chạy nó ngoài Cloudflare (workerd, Node và tương tự) bên trong VPC, runtime _có thể_ truy cập IP nội bộ. Hãy đặt tường lửa egress phía trước và chặn các dải riêng: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, và các dải IPv6 tương đương. Mã ứng dụng không thể thực thi điều đó khi bạn đã ra ngoài Cloudflare.

## Tắt Proxy

Nếu bạn không muốn dùng CORS proxy, hãy đặt biến môi trường thành chuỗi rỗng:

```
VITE_CORS_PROXY_URL=
```

**Lưu ý**: Khi không có proxy, việc ký bằng các chứng chỉ cần lấy chuỗi từ bên ngoài (như FNMT hoặc một số CA doanh nghiệp) sẽ thất bại với lỗi "Failed to fetch".

## Khắc phục sự cố

### "Signing error: TypeError: Failed to fetch"

Điều này thường có nghĩa là:

1. **Chưa cấu hình CORS proxy**: Đặt `VITE_CORS_PROXY_URL` và build lại
2. **Bị chặn nội dung hỗn hợp**: Trang của bạn dùng HTTPS nhưng URL bên cấp phát của chứng chỉ là HTTP. CORS proxy giải quyết việc này.
3. **CORS proxy từ chối origin của bạn**: Kiểm tra tên miền của bạn có trong mảng `ALLOWED_ORIGINS` trong `cors-proxy-worker.js` không

### "403 Forbidden" từ proxy

Tên miền của bạn không có trong danh sách `ALLOWED_ORIGINS`. Sửa `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Sau đó triển khai lại: `npx wrangler deploy`

### Kiểm tra proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Chứng chỉ hoạt động không cần proxy

Một số chứng chỉ chứa đủ chuỗi trong tệp P12/PFX và không cần lấy từ bên ngoài:

- Chứng chỉ tự ký
- Một số CA thương mại đóng gói sẵn các chứng chỉ trung gian
- Chứng chỉ bạn tự ghép đủ chuỗi
