# Primeiros Passos

Bem-vindo ao Pixel PDF! Este guia vai ajudar você a começar rapidamente.

## O que é o Pixel PDF?

O Pixel PDF é um kit de ferramentas PDF gratuito, de código aberto e focado em privacidade, que funciona **inteiramente no seu navegador**. Seus arquivos nunca saem do seu dispositivo: todo o processamento acontece localmente com a tecnologia WebAssembly (WASM).

## Início Rápido

### Opção 1: Use a Versão Hospedada

Acesse [pixelpdf.com](https://www.pixelpdf.com) para usar o Pixel PDF na hora, sem instalação.

### Opção 2: Hospede por Conta Própria com Docker

> [!IMPORTANT]
> A conversão de arquivos do Office requer `SharedArrayBuffer`, que exige ambos:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - um contexto seguro
>
> `http://localhost` funciona para testes locais porque os navegadores tratam o loopback como confiável. `http://192.168.x.x` ou outros IPs de rede local normalmente não funcionam, então as conversões de Word/Excel/PowerPoint exigirão HTTPS quando acessadas de outros dispositivos da sua rede.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> O Pixel PDF vem em duas versões: a **versão Self-Hosted** (`pixelpdf-simple`, usada acima) para implantações internas, de equipes e organizações, e a **versão Comercial** (`pixelpdf:latest`), usada pelo próprio pixelpdf.com e por titulares de licença comercial que mantêm implantações públicas. Ambas incluem as mesmas ferramentas de PDF: a versão Comercial adiciona o hero, o FAQ, os depoimentos e o rodapé do pixelpdf.com. Em caso de dúvida, use a versão Self-Hosted.

Depois, abra `http://localhost:3000` no seu navegador.

> [!NOTE]
> Se você está preparando uma implantação de OCR isolada da internet (air-gapped), é preciso hospedar internamente as fontes da camada de texto do OCR, além do worker do Tesseract, do runtime principal e dos arquivos traineddata. A configuração completa está documentada em [Self-Hosting](/pt/self-hosting/), incluindo `VITE_OCR_FONT_BASE_URL` e o diretório `ocr-fonts/` incluído.

### Opção 3: Compile a Partir do Código-Fonte

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Recursos em Resumo

| Categoria              | Ferramentas                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **Converter para PDF** | Word, Excel, PowerPoint, Imagens, Markdown, EPUB, MOBI e mais         |
| **Converter de PDF**   | JPG, PNG, Texto, Excel, SVG e mais                                    |
| **Editar e Anotar**    | Assinar, Destacar, Redigir, Preencher Formulários, Adicionar Carimbos |
| **Organizar**          | Mesclar, Dividir, Girar, Excluir Páginas, Reordenar                   |
| **Otimizar**           | Comprimir, Reparar, Nivelar, OCR                                      |
| **Segurança**          | Criptografar, Descriptografar, Remover Restrições                     |

## Suporte a Navegadores

O Pixel PDF funciona melhor em navegadores modernos:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Próximos Passos

- [Explore todas as ferramentas](/pt/tools/)
- [Hospede o Pixel PDF por conta própria](/pt/self-hosting/)
- [Contribua com o projeto](/pt/contributing)
