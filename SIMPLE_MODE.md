# Simple Mode for BentoPDF

Simple Mode is designed for internal organizational use where you want to hide all branding and marketing content, showing only the essential PDF tools for your users.

## What Simple Mode Does

When enabled, Simple Mode will:

- Hide the navigation bar
- Hide the hero section with marketing content
- Hide the features section
- Hide the security/compliance section
- Hide the FAQ section
- Hide the testimonials section
- Hide the support section
- Hide the footer
- Update the page title to "PDF Tools"
- Make the tools section more prominent

## How to Enable Simple Mode

### Method 1: Using Pre-built Simple Mode Image (Recommended)

Use the pre-built Simple Mode image directly:

**Using GitHub Container Registry (Recommended):**

```bash
# Docker
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

**Using Docker Hub:**

```bash
# Docker
docker run -p 3000:8080 bentopdfteam/bentopdf-simple:latest

# Podman
podman run -p 3000:8080 docker.io/bentopdfteam/bentopdf-simple:latest
```

Or with Docker Compose / Podman Compose:

```yaml
services:
  bentopdf:
    # Using GitHub Container Registry (Recommended)
    image: ghcr.io/alam00000/bentopdf-simple:latest
    # Or using Docker Hub
    # image: bentopdfteam/bentopdf-simple:latest
    container_name: bentopdf
    restart: unless-stopped
    ports:
      - '3000:8080'
```

### Method 2: Using Docker Compose with Build

Build the image locally with Simple Mode enabled:

```bash
docker compose -f docker-compose.dev.yml build --build-arg SIMPLE_MODE=true
docker compose -f docker-compose.dev.yml up -d
```

### Method 3: Using Docker Build

Build the image with the SIMPLE_MODE build argument:

```bash
docker build --build-arg SIMPLE_MODE=true -t bentopdf-simple .
docker run -p 3000:8080 bentopdf-simple
```

### Method 4: Using npm Script (Easiest for Local Development)

Use the built-in npm script that handles everything:

```bash
npm run serve:simple
```

This command automatically:

- Sets `SIMPLE_MODE=true`
- Builds the project with Simple Mode enabled
- Serves the built files on `http://localhost:3000`

### Method 5: Using Environment Variables

Set the environment variable before building:

```bash
export SIMPLE_MODE=true
npm run build
npx serve dist -p 3000
```

## 🧪 Testing Simple Mode Locally

### Method 1: Using npm Script (Easiest for Development)

```bash
npm run serve:simple
```

This automatically builds and serves Simple Mode on `http://localhost:3000`.

### Method 2: Using Pre-built Image (Easiest for Production)

```bash
# Docker - Pull and run the Simple Mode image
docker pull ghcr.io/alam00000/bentopdf-simple:latest
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman pull ghcr.io/alam00000/bentopdf-simple:latest
podman run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Open `http://localhost:3000` in your browser.

### Method 3: Build and Test Locally

```bash
# Build with simple mode
SIMPLE_MODE=true npm run build

# Serve the built files
npx serve dist -p 3000
```

Open `http://localhost:3000` in your browser.

### Method 4: Compare Both Modes

```bash
# Test Normal Mode (Docker)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest

# Test Simple Mode (Docker)
docker run -p 3001:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman users: replace 'docker' with 'podman'
```

- Normal Mode: `http://localhost:3000`
- Simple Mode: `http://localhost:3001`

## 🔍 What to Look For

When Simple Mode is working correctly, you should see:

- ✅ Clean "PDF Tools" header (no marketing hero section)
- ✅ "Select a tool to get started" subtitle
- ✅ Search bar for tools
- ✅ All PDF tool cards organized by category
- ❌ No navigation bar
- ❌ No hero section with "The PDF Toolkit built for privacy"
- ❌ No features, FAQ, testimonials, or footer sections

## 📦 Available Container Images

### Normal Mode (Full Branding)

**GitHub Container Registry (Recommended):**

- `ghcr.io/alam00000/bentopdf:latest`
- `ghcr.io/alam00000/bentopdf:v1.0.0` (versioned)

**Docker Hub:**

- `bentopdfteam/bentopdf:latest`
- `bentopdfteam/bentopdf:v1.0.0` (versioned)

### Simple Mode (Clean Interface)

**GitHub Container Registry (Recommended):**

- `ghcr.io/alam00000/bentopdf-simple:latest`
- `ghcr.io/alam00000/bentopdf-simple:v1.0.0` (versioned)

**Docker Hub:**

- `bentopdfteam/bentopdf-simple:latest`
- `bentopdfteam/bentopdf-simple:v1.0.0` (versioned)

## 🚀 Production Deployment Examples

### Docker Compose / Podman Compose

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest # Recommended
    # image: bentopdfteam/bentopdf-simple:latest     # Alternative: Docker Hub
    container_name: bentopdf
    restart: unless-stopped
    ports:
      - '80:8080'
    environment:
      - PUID=1000
      - PGID=1000
```

### Podman Quadlet (Linux Systemd)

Create `~/.config/containers/systemd/bentopdf-simple.container`:

```ini
[Unit]
Description=BentoPDF Simple Mode
After=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf-simple
PublishPort=80:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

Enable and start:

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf-simple
```

## ⚠️ Important Notes

- **Pre-built images**: Use `ghcr.io/alam00000/bentopdf-simple:latest` for Simple Mode (recommended)
- **Environment variables**: `SIMPLE_MODE=true` only works during build, not runtime
- **Build-time optimization**: Simple Mode uses dead code elimination for smaller bundles
- **Same functionality**: All PDF tools work identically in both modes
