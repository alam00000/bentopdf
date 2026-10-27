# Deploy dengan Kubernetes

Kubernetes mungkin berlebihan untuk situs statis, tetapi bisa sangat cocok jika Anda sudah menstandarkan Helm + GitOps.

> [!IMPORTANT]
> **Header yang Diperlukan untuk Konversi File Office**
>
> Alat berbasis LibreOffice (konversi Word, Excel, PowerPoint) memerlukan header HTTP berikut untuk dukungan `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Image nginx resmi BentoPDF sudah menyertakan header ini. Di Kubernetes, **controller Ingress/Gateway juga merupakan reverse proxy**, jadi pastikan header ini tetap dipertahankan (atau tambahkan di edge).

## Prasyarat

- Klaster Kubernetes
- Helm v3
- Image nginx BentoPDF (misalnya `ghcr.io/alam00000/bentopdf:<tag>`) yang melayani di **port 8080**

## Deploy dengan Helm

### Instal dari repo ini (chart lokal)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Instal dari GHCR (chart OCI)

Jika chart dipublikasikan ke GHCR sebagai artefak OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Mengeksposnya

### Port-forward (uji cepat)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (opsional)

Aktifkan Ingress (contoh untuk nginx-ingress):

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

### Gateway API (opsional)

Chart ini mendukung Gateway API `Gateway` + `HTTPRoute`.

Contoh (operator Cloudflare Gateway API):

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

## Memastikan header SharedArrayBuffer tetap berfungsi (Ingress/Gateway)

### Apa yang "seharusnya" terjadi

Konfigurasi nginx BentoPDF menetapkan header respons yang diperlukan. Sebagian besar controller Ingress/Gateway **meneruskan header respons upstream tanpa perubahan**.

### Apa yang bisa merusaknya

- Kebijakan controller/edge yang **menimpa** atau **menghapus** header respons
- Middleware "security headers" yang menetapkan nilai COOP/COEP yang berbeda

### Cara memverifikasi

Jalankan perintah ini pada endpoint publik Anda:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Anda seharusnya melihat:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Jika controller Ingress Anda tidak mempertahankannya

Tambahkan header di edge (bergantung pada controller). Contoh untuk **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Error MIME-type `.mjs` (iframe Tanda Tangani PDF / Form Filler kosong)

Jika konsol browser menampilkan `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` pada permintaan `.mjs`, berarti controller Ingress/Gateway di depan nginx BentoPDF mengganti header `Content-Type` upstream dengan `application/octet-stream`.

Nginx pada image BentoPDF sudah melayani `.mjs` sebagai `application/javascript`. Solusinya adalah menghentikan controller dari menghapus/menggantinya. Untuk nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Atau gunakan filter `ResponseHeaderModifier` di Gateway API untuk menetapkan `Content-Type: application/javascript` pada path `.mjs`. Verifikasi dengan DevTools → tab Network: permintaan `.mjs` yang gagal seharusnya kini menampilkan `content-type: application/javascript`.

### Jika Anda memakai Gateway API dan ingin menambahkan header secara paksa

Gateway API mendukung filter `ResponseHeaderModifier`. Anda dapat memasangnya di `httpRoute.rules[*].filters`:

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

Dukungan untuk filter tertentu bergantung pada controller Gateway Anda; jika sebuah filter diabaikan, tambahkan header di lapisan edge/controller.

## Menonaktifkan Alat Tertentu

Gunakan ConfigMap untuk menonaktifkan alat saat runtime tanpa membangun ulang image:

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

Mount ke direktori yang dilayani:

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

ID alat adalah URL halaman tanpa `.html`: buka alat apa pun dan lihat URL-nya (misalnya `edit-pdf`, `merge-pdf`, `compress-pdf`). Alat yang dinonaktifkan disembunyikan dari beranda, pencarian, pintasan, pembuat alur kerja, dan akses URL langsung. Lihat [panduan Docker](/id/self-hosting/docker#menonaktifkan-alat-tertentu) untuk daftar lengkap opsi.
