# Proxy CORS para obtener certificados

La herramienta de firma digital usa un proxy CORS para obtener los certificados de los emisores desde Autoridades de Certificación (CA) externas. Es necesario porque muchos servidores de CA no incluyen cabeceras CORS en sus respuestas, lo que impide la descarga directa desde el navegador.

Además, muchos servidores de CA sirven los certificados por HTTP simple. Cuando tu instancia de BentoPDF se aloja por HTTPS, los navegadores bloquean estas solicitudes HTTP (política de contenido mixto). El proxy CORS resuelve ambos problemas al enrutar las solicitudes a través de un endpoint HTTPS con las cabeceras adecuadas.

## Cómo funciona

Al firmar un PDF con un certificado:

1. La biblioteca `zgapdfsigner` intenta construir una cadena de certificados completa
2. Obtiene los certificados de los emisores desde las URL incluidas en la extensión AIA (Authority Information Access) de tu certificado
3. Estas solicitudes pasan por un proxy CORS que añade las cabeceras `Access-Control-Allow-Origin` necesarias
4. El proxy devuelve los datos del certificado al navegador

## Autoalojar el proxy CORS

Si autoalojas BentoPDF, tendrás que desplegar tu propio proxy CORS para que las firmas digitales funcionen con certificados que requieren obtener la cadena.

### Opción 1: Cloudflare Workers (recomendada)

1. **Instala la CLI de Wrangler**:

   ```bash
   npm install -g wrangler
   ```

2. **Inicia sesión en Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clona BentoPDF y actualiza los orígenes permitidos**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Abre `cors-proxy-worker.js` y cambia el array `ALLOWED_ORIGINS` por tu dominio:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Importante
   Sin este cambio, el proxy rechazará todas las solicitudes de tu sitio con un error **403 Forbidden**. Por defecto solo permite solicitudes de `bentopdf.com`.
   :::

4. **Despliega el proxy**:

   ```bash
   wrangler deploy
   ```

   Anota la URL de tu worker (p. ej., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Vuelve a compilar BentoPDF con la URL del proxy**:

   Si usas Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Si compilas desde el código fuente:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opción 2: Proxy de backend personalizado

También puedes crear tu propio endpoint de proxy. Los requisitos son:

1. Aceptar solicitudes GET con un parámetro de consulta `url`
2. Obtener la URL desde tu servidor (sin restricciones CORS en el lado del servidor)
3. Devolver la respuesta con estas cabeceras:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Ejemplo de implementación con Express.js:

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

## Consideraciones de seguridad

El Cloudflare Worker incluido tiene varias medidas de seguridad:

| Función                        | Descripción                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Validación de origen**       | Solo permite solicitudes de los dominios incluidos en `ALLOWED_ORIGINS`                                |
| **Restricciones de URL**       | Solo permite URL de certificados (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)                  |
| **Bloqueo de IP privadas**     | Bloquea rangos privados IPv4/IPv6, link-local, loopback, IP decimales y metadatos de la nube           |
| **Seguridad del Content-Type** | Solo devuelve tipos MIME de certificado seguros y bloquea la inyección de content-type desde el origen |
| **Límite de tamaño**           | Transmite la respuesta con un límite de 10MB y aborta la descarga si se supera                         |
| **Limitación de velocidad**    | 60 solicitudes por minuto por IP o IPv6 /64 (requiere KV, permite el paso si KV falla)                 |
| **Firmas HMAC**                | Firma opcional en el cliente (disuade el abuso casual)                                                 |

### Reenlace de DNS (DNS rebinding) al autoalojar fuera de Cloudflare

El worker rechaza cualquier URL que se resuelva a una IP privada o interna. No puede usar una lista fija de hosts permitidos, ya que las URL de la cadena de certificados apuntan a la CA que emitió el certificado (FNMT, CA corporativas, etc.), por lo que los destinos no se conocen de antemano. Eso deja una pequeña ventana de rebinding: quien controle el DNS de su propio dominio podría devolver una IP pública a la comprobación de seguridad y una privada a la solicitud real un instante después.

En Cloudflare esto no es explotable: los Workers no pueden alcanzar IP privadas ni el endpoint de metadatos `169.254.169.254`, así que el rebinding no llega a nada. Simplemente no le des al worker una vía de entrada: no le asocies un Tunnel, un Service ni un binding de red privada (solo necesita `RATE_LIMIT_KV`).

Si lo ejecutas fuera de Cloudflare (workerd, Node y similares) dentro de una VPC, el runtime _sí_ puede alcanzar IP internas. Coloca un firewall de salida delante y bloquea los rangos privados: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` y sus equivalentes IPv6. El código de la aplicación no puede imponerlo una vez que estás fuera de Cloudflare.

## Desactivar el proxy

Si no quieres usar un proxy CORS, define la variable de entorno como una cadena vacía:

```
VITE_CORS_PROXY_URL=
```

**Nota**: Sin el proxy, firmar con certificados que requieren obtener la cadena externamente (como FNMT o algunas CA corporativas) fallará con el error "Failed to fetch".

## Solución de problemas

### "Signing error: TypeError: Failed to fetch"

Normalmente significa una de estas cosas:

1. **No hay proxy CORS configurado**: define `VITE_CORS_PROXY_URL` y vuelve a compilar
2. **Contenido mixto bloqueado**: tu sitio usa HTTPS pero la URL del emisor del certificado es HTTP. El proxy CORS lo resuelve.
3. **El proxy CORS rechaza tu origen**: comprueba que tu dominio esté en el array `ALLOWED_ORIGINS` de `cors-proxy-worker.js`

### "403 Forbidden" del proxy

Tu dominio no está en la lista `ALLOWED_ORIGINS`. Edita `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Después vuelve a desplegar: `npx wrangler deploy`

### Probar el proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Certificados que funcionan sin proxy

Algunos certificados incluyen la cadena completa en el archivo P12/PFX y no requieren obtención externa:

- Certificados autofirmados
- Algunas CA comerciales que incluyen los certificados intermedios
- Certificados que has ensamblado manualmente con la cadena completa
