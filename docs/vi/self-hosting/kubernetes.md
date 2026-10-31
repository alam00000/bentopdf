# Triển khai với Kubernetes

Kubernetes có thể là quá mức cần thiết cho một trang web tĩnh, nhưng sẽ rất phù hợp nếu bạn đã chuẩn hóa theo Helm + GitOps.

> [!IMPORTANT]
> **Header bắt buộc để chuyển đổi tệp Office**
>
> Các công cụ dựa trên LibreOffice (chuyển đổi Word, Excel, PowerPoint) cần các header HTTP sau để hỗ trợ `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Các image nginx chính thức của BentoPDF đã bao gồm các header này. Trong Kubernetes, **bộ điều khiển Ingress/Gateway cũng là reverse proxy**, vì vậy hãy đảm bảo các header này được giữ nguyên (hoặc thêm chúng ở lớp biên).

## Điều kiện tiên quyết

- Cụm Kubernetes
- Helm v3
- Một image nginx của BentoPDF (ví dụ `ghcr.io/alam00000/bentopdf:<tag>`) phục vụ trên **cổng 8080**

## Triển khai với Helm

### Cài đặt từ repo này (chart cục bộ)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Cài đặt từ GHCR (chart OCI)

Nếu chart được xuất bản lên GHCR dưới dạng artifact OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Công khai dịch vụ

### Port-forward (thử nhanh)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (tùy chọn)

Bật Ingress (ví dụ cho nginx-ingress):

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: pdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Gateway API (tùy chọn)

Chart này hỗ trợ Gateway API `Gateway` + `HTTPRoute`.

Ví dụ (operator Cloudflare Gateway API):

```yaml
gateway:
  enabled: true
  name: bento-tunnel
  namespace: bentopdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: bento-tunnel
      namespace: bentopdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Đảm bảo các header SharedArrayBuffer vẫn hoạt động (Ingress/Gateway)

### Điều "đáng lẽ" xảy ra

Cấu hình nginx của BentoPDF đặt các header phản hồi cần thiết. Hầu hết bộ điều khiển Ingress/Gateway **chuyển tiếp nguyên vẹn các header phản hồi từ upstream**.

### Điều có thể làm hỏng

- Một chính sách của bộ điều khiển/lớp biên **ghi đè** hoặc **loại bỏ** các header phản hồi
- Một middleware "security headers" đặt giá trị COOP/COEP khác

### Cách kiểm tra

Chạy lệnh này với endpoint công khai của bạn:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Bạn sẽ thấy:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Nếu bộ điều khiển Ingress của bạn không giữ nguyên chúng

Hãy thêm header ở lớp biên (tùy theo bộ điều khiển). Ví dụ cho **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Lỗi kiểu MIME của `.mjs` (Ký PDF / iframe Form Filler bị trống)

Nếu bảng điều khiển trình duyệt hiển thị `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` ở một yêu cầu `.mjs`, nghĩa là một bộ điều khiển Ingress/Gateway đặt phía trước nginx của BentoPDF đang thay header `Content-Type` từ upstream bằng `application/octet-stream`.

Nginx trong image BentoPDF vốn đã phục vụ `.mjs` với kiểu `application/javascript`. Cách khắc phục là ngăn bộ điều khiển loại bỏ/thay thế nó. Với nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Hoặc dùng bộ lọc `ResponseHeaderModifier` trong Gateway API để đặt `Content-Type: application/javascript` cho các đường dẫn `.mjs`. Kiểm tra bằng DevTools → tab Network: yêu cầu `.mjs` từng lỗi giờ sẽ hiển thị `content-type: application/javascript`.

### Nếu bạn dùng Gateway API và muốn buộc thêm header

Gateway API hỗ trợ bộ lọc `ResponseHeaderModifier`. Bạn có thể gắn nó trong `httpRoute.rules[*].filters`:

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: bento-tunnel
      namespace: misc
      sectionName: http
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      filters:
        - type: ResponseHeaderModifier
          responseHeaderModifier:
            set:
              - name: Cross-Origin-Opener-Policy
                value: same-origin
              - name: Cross-Origin-Embedder-Policy
                value: require-corp
```

Việc hỗ trợ từng bộ lọc cụ thể tùy thuộc vào bộ điều khiển Gateway của bạn; nếu một bộ lọc bị bỏ qua, hãy thêm header ở lớp biên/bộ điều khiển.

## Tắt công cụ cụ thể

Dùng ConfigMap để tắt công cụ lúc chạy mà không cần dựng lại image:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bentopdf-config
  namespace: bentopdf
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Gắn nó vào thư mục được phục vụ:

```yaml
spec:
  containers:
    - name: bentopdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: bentopdf-config
```

ID công cụ là URL của trang bỏ đi `.html`. Hãy mở bất kỳ công cụ nào và xem URL (ví dụ: `edit-pdf`, `merge-pdf`, `compress-pdf`). Công cụ bị tắt sẽ bị ẩn khỏi trang chủ, tìm kiếm, phím tắt, trình tạo quy trình và truy cập trực tiếp bằng URL. Xem [hướng dẫn Docker](/vi/self-hosting/docker#tat-mot-so-cong-cu) để biết đầy đủ các tùy chọn.
