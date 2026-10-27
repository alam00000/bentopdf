# 用于获取证书的 CORS 代理

数字签名工具使用 CORS 代理从外部证书颁发机构 (CA) 获取颁发者证书。这是必要的，因为许多 CA 服务器的响应中不包含 CORS 响应头，导致浏览器无法直接获取。

此外，许多 CA 服务器通过纯 HTTP 提供证书。当您的 BentoPDF 实例通过 HTTPS 托管时，浏览器会阻止这些 HTTP 请求（混合内容策略）。CORS 代理通过 HTTPS 端点并附带正确的响应头转发请求，从而同时解决这两个问题。

## 工作原理

使用证书为 PDF 签名时：

1. `zgapdfsigner` 库会尝试构建完整的证书链
2. 它从您证书的 AIA (Authority Information Access) 扩展中嵌入的 URL 获取颁发者证书
3. 这些请求会经由 CORS 代理转发，代理会添加必要的 `Access-Control-Allow-Origin` 响应头
4. 代理将证书数据返回给浏览器

## 自托管 CORS 代理

如果您自托管 BentoPDF，则需要部署自己的 CORS 代理，数字签名才能处理需要获取证书链的证书。

### 方案 1：Cloudflare Workers（推荐）

1. **安装 Wrangler CLI**：

   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**：

   ```bash
   wrangler login
   ```

3. **克隆 BentoPDF 并更新允许的来源**：

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   打开 `cors-proxy-worker.js`，将 `ALLOWED_ORIGINS` 数组改为您的域名：

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning 重要
   如果不做此修改，代理会以 **403 Forbidden** 错误拒绝来自您站点的所有请求。默认设置只允许来自 `bentopdf.com` 的请求。
   :::

4. **部署代理**：

   ```bash
   wrangler deploy
   ```

   记下您的 worker URL（例如 `https://bentopdf-cors-proxy.your-subdomain.workers.dev`）。

5. **使用代理 URL 重新构建 BentoPDF**：

   如果使用 Docker：

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   如果从源码构建：

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### 方案 2：自定义后端代理

您也可以创建自己的代理端点。要求如下：

1. 接受带有 `url` 查询参数的 GET 请求
2. 从您的服务器获取该 URL（服务端不受 CORS 限制）
3. 返回响应时附带以下响应头：
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Express.js 实现示例：

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

## 安全注意事项

随附的 Cloudflare Worker 包含多项安全措施：

| 特性                  | 说明                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| **来源验证**          | 仅允许来自 `ALLOWED_ORIGINS` 中所列域名的请求                         |
| **URL 限制**          | 仅允许证书 URL（`.crt`、`.cer`、`.pem`、`/certs/`、`/ocsp`、`/crl`）  |
| **私有 IP 拦截**      | 拦截 IPv4/IPv6 私有地址段、链路本地、环回、十进制 IP 以及云元数据地址 |
| **Content-Type 安全** | 仅返回安全的证书 MIME 类型，阻止上游 content-type 注入                |
| **文件大小限制**      | 以流式方式返回响应，限制为 10MB，超出时在下载中途中止                 |
| **速率限制**          | 每个 IP 或 IPv6 /64 每分钟 60 次请求（需要 KV，KV 出错时放行）        |
| **HMAC 签名**         | 可选的客户端签名（可阻止随意滥用）                                    |

### DNS 重绑定（不在 Cloudflare 上自托管时）

worker 会拒绝任何解析到私有或内部 IP 的 URL。它无法使用固定的主机白名单，因为证书链 URL 指向的是签发该证书的任意 CA（FNMT、企业 CA 等），所以目标地址事先无法确定。这就留下了一个很小的重绑定窗口：运行自己域名 DNS 的人可以在安全检查时返回公网 IP，稍后在实际请求时返回私有 IP。

在 Cloudflare 上这无法被利用：Workers 无法访问私有 IP 或 `169.254.169.254` 元数据端点，所以重绑定不会指向任何目标。只需注意不要给 worker 开放入口：不要附加 Tunnel、Service 或私有网络绑定（它只需要 `RATE_LIMIT_KV`）。

如果您在 VPC 内的 Cloudflare 之外运行它（workerd、Node 等），运行时*可以*访问内部 IP。请在它前面放置出站防火墙，并拦截私有地址段：`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`、`169.254.0.0/16`，以及它们对应的 IPv6 地址段。一旦脱离 Cloudflare，应用代码无法强制实现这一点。

## 禁用代理

如果不想使用 CORS 代理，请将环境变量设置为空字符串：

```
VITE_CORS_PROXY_URL=
```

**注意**：没有代理时，使用需要获取外部证书链的证书（如 FNMT 或某些企业 CA）进行签名会失败，并报 "Failed to fetch" 错误。

## 故障排查

### "Signing error: TypeError: Failed to fetch"

这通常意味着以下情况之一：

1. **未配置 CORS 代理**：设置 `VITE_CORS_PROXY_URL` 并重新构建
2. **混合内容被阻止**：您的站点使用 HTTPS，但证书的颁发者 URL 是 HTTP。CORS 代理可解决此问题。
3. **CORS 代理拒绝了您的来源**：请检查您的域名是否在 `cors-proxy-worker.js` 的 `ALLOWED_ORIGINS` 数组中

### 代理返回 "403 Forbidden"

您的域名不在 `ALLOWED_ORIGINS` 列表中。编辑 `cors-proxy-worker.js`：

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

然后重新部署：`npx wrangler deploy`

### 测试代理

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### 无需代理即可使用的证书

有些证书在 P12/PFX 文件中包含完整的证书链，不需要获取外部证书：

- 自签名证书
- 某些捆绑了中间证书的商业 CA
- 您手动组装了完整证书链的证书
