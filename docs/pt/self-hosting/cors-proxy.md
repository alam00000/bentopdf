# Proxy CORS para Buscar Certificados

A ferramenta de assinatura digital usa um proxy CORS para buscar certificados de emissores em Autoridades Certificadoras (CAs) externas. Isso é necessário porque muitos servidores de CA não incluem cabeçalhos CORS nas respostas, o que impede a busca direta pelo navegador.

Além disso, muitos servidores de CA entregam certificados por HTTP simples. Quando sua instância do BentoPDF é hospedada em HTTPS, os navegadores bloqueiam essas requisições HTTP (política de conteúdo misto). O proxy CORS resolve os dois problemas encaminhando as requisições por um endpoint HTTPS com os cabeçalhos corretos.

## Como Funciona

Ao assinar um PDF com um certificado:

1. A biblioteca `zgapdfsigner` tenta montar uma cadeia de certificados completa
2. Ela busca os certificados dos emissores em URLs incorporadas na extensão AIA (Authority Information Access) do seu certificado
3. Essas requisições passam por um proxy CORS que adiciona os cabeçalhos `Access-Control-Allow-Origin` necessários
4. O proxy devolve os dados do certificado ao navegador

## Hospedando o Proxy CORS por Conta Própria

Se você hospeda o BentoPDF por conta própria, precisará implantar seu próprio proxy CORS para que as assinaturas digitais funcionem com certificados que exigem busca da cadeia.

### Opção 1: Cloudflare Workers (Recomendado)

1. **Instale a CLI do Wrangler**:

   ```bash
   npm install -g wrangler
   ```

2. **Faça login no Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clone o BentoPDF e atualize as origens permitidas**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Abra `cors-proxy-worker.js` e altere o array `ALLOWED_ORIGINS` para o seu domínio:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Importante
   Sem essa alteração, o proxy rejeitará todas as requisições do seu site com um erro **403 Forbidden**. O padrão só permite requisições de `bentopdf.com`.
   :::

4. **Implante o proxy**:

   ```bash
   wrangler deploy
   ```

   Anote a URL do seu worker (p. ex., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Recompile o BentoPDF com a URL do proxy**:

   Se estiver usando Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Se estiver compilando a partir do código-fonte:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opção 2: Proxy de Backend Personalizado

Você também pode criar seu próprio endpoint de proxy. Os requisitos são:

1. Aceitar requisições GET com um parâmetro de consulta `url`
2. Buscar a URL a partir do seu servidor (sem restrições de CORS no lado do servidor)
3. Devolver a resposta com estes cabeçalhos:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Exemplo de implementação com Express.js:

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

## Considerações de Segurança

O Cloudflare Worker incluído tem várias medidas de segurança:

| Recurso                          | Descrição                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Validação de Origem**          | Só permite requisições de domínios listados em `ALLOWED_ORIGINS`                                  |
| **Restrições de URL**            | Só permite URLs de certificados (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)              |
| **Bloqueio de IP Privado**       | Bloqueia faixas privadas IPv4/IPv6, link-local, loopback, IPs decimais e metadados de nuvem       |
| **Segurança de Content-Type**    | Só devolve tipos MIME de certificado seguros e bloqueia injeção de content-type vinda do upstream |
| **Limite de Tamanho de Arquivo** | Transmite a resposta com limite de 10MB e interrompe o download se for excedido                   |
| **Limitação de Taxa**            | 60 requisições por minuto por IP ou IPv6 /64 (requer KV, libera o acesso se o KV falhar)          |
| **Assinaturas HMAC**             | Assinatura opcional no cliente (desestimula abuso casual)                                         |

### DNS rebinding (hospedagem própria fora do Cloudflare)

O worker rejeita qualquer URL que resolva para um IP privado ou interno. Ele não pode usar uma lista fixa de hosts permitidos, pois as URLs da cadeia de certificados apontam para a CA que emitiu o certificado (FNMT, CAs corporativas e assim por diante), então os destinos não são conhecidos de antemão. Isso deixa uma pequena janela de rebinding: quem controla o DNS do próprio domínio poderia devolver um IP público na verificação de segurança e um IP privado na requisição real, logo em seguida.

No Cloudflare isso não é explorável: os Workers não alcançam IPs privados nem o endpoint de metadados `169.254.169.254`, então um rebind não chega a lugar nenhum. Apenas não dê ao worker um caminho de entrada: não anexe um Tunnel, Service ou binding de rede privada (ele só precisa de `RATE_LIMIT_KV`).

Se você executa isso fora do Cloudflare (workerd, Node e similares) dentro de uma VPC, o runtime _consegue_ alcançar IPs internos. Coloque um firewall de saída na frente dele e bloqueie as faixas privadas: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` e seus equivalentes IPv6. O código da aplicação não consegue impor isso fora do Cloudflare.

## Desativando o Proxy

Se você não quer usar um proxy CORS, defina a variável de ambiente como uma string vazia:

```
VITE_CORS_PROXY_URL=
```

**Observação**: Sem o proxy, a assinatura com certificados que exigem busca externa da cadeia (como FNMT ou algumas CAs corporativas) falhará com o erro "Failed to fetch".

## Solução de Problemas

### "Signing error: TypeError: Failed to fetch"

Isso geralmente significa uma destas situações:

1. **Nenhum proxy CORS configurado**: defina `VITE_CORS_PROXY_URL` e recompile
2. **Conteúdo misto bloqueado**: seu site usa HTTPS, mas a URL do emissor do certificado usa HTTP. O proxy CORS resolve isso.
3. **Proxy CORS rejeitando sua origem**: verifique se o seu domínio está no array `ALLOWED_ORIGINS` em `cors-proxy-worker.js`

### "403 Forbidden" vindo do proxy

Seu domínio não está na lista `ALLOWED_ORIGINS`. Edite `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Depois, implante novamente: `npx wrangler deploy`

### Testando o proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificados que Funcionam Sem Proxy

Alguns certificados incluem a cadeia completa no arquivo P12/PFX e não exigem busca externa:

- Certificados autoassinados
- Algumas CAs comerciais que incluem certificados intermediários
- Certificados que você montou manualmente com a cadeia completa
