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

### Using Docker Compose

1. Create a `.env` file in your project root:

```bash
SIMPLE_MODE=true
```

2. Run with docker-compose:

```bash
docker-compose up -d
```

### Using Docker Build

Build the image with the SIMPLE_MODE environment variable:

```bash
docker build --build-arg SIMPLE_MODE=true -t bentopdf-simple .
```

### Using Environment Variables

Set the environment variable before building:

```bash
export SIMPLE_MODE=true
npm run build
```

## 🧪 Testing Simple Mode Locally

After building with Simple Mode enabled, you need to serve the built files locally.

```bash
# Build with simple mode
SIMPLE_MODE=true npm run build

# Serve the built files
npx serve dist -p 3000
```

Then open `http://localhost:3000` in your browser.

## 🔍 What to Look For

When Simple Mode is working correctly, you should see:

- ✅ Clean "PDF Tools" header (no marketing hero section)
- ✅ "Select a tool to get started" subtitle
- ✅ Search bar for tools
- ✅ All PDF tool cards organized by category
- ❌ No navigation bar
- ❌ No hero section with "The PDF Toolkit built for privacy"
- ❌ No features, FAQ, testimonials, or footer sections

## Example Docker Compose Configuration

```yaml
services:
  bentopdf:
    image: bentopdf/bentopdf:latest
    container_name: bentopdf
    restart: unless-stopped
    ports:
      - '3000:80'
    environment:
      - SIMPLE_MODE=true
```
