# BentoPDF

**BentoPDF** is a powerful, privacy-first, client-side PDF toolkit that allows you to manipulate, edit, merge, and process PDF files directly in your browser. No server-side processing is required, ensuring your files remain secure and private.

![Docker Pulls](https://img.shields.io/docker/pulls/bentopdf/bentopdf) [![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20Coffee-yellow?logo=kofi&style=flat-square)](https://ko-fi.com/alio0) ![GitHub Stars](https://img.shields.io/github/stars/alam00000/bentopdf?style=social)
[![Sponsor me on GitHub](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ff69b4)](https://github.com/sponsors/alam00000)

## ⭐ Stargazers over time

[![Star History Chart](https://api.star-history.com/svg?repos=alam00000/bentopdf&type=Date)](https://star-history.com/#alam00000/bentopdf&Date)

---

## ✨ Why BentoPDF?

- **Privacy First**: All processing happens in your browser. Your files are never uploaded to a server, guaranteeing 100% privacy.
- **No Limits**: Manipulate as many files as you want, as often you want. There are no restrictions or upload limits.
- **High Performance**: Built with modern web technologies, BentoPDF is fast and efficient, handling even large PDF files with ease.
- **Completely Free**: BentoPDF is a free and open-source tool for everyone.

---

## 🛠️ Features / Tools Supported

BentoPDF offers a comprehensive suite of tools to handle all your PDF needs.

### Organize & Manage PDFs

| Tool Name                 | Description                                                                |
| :------------------------ | :------------------------------------------------------------------------- |
| **Merge PDFs**            | Combine multiple PDF files into one.                                       |
| **Split PDFs**            | Extract specific pages or divide a document into smaller files.            |
| **Organize Pages**        | Reorder, duplicate, or delete pages with a simple drag-and-drop interface. |
| **Extract Pages**         | Save a specific range of pages as a new PDF.                               |
| **Delete Pages**          | Remove unwanted pages from your document.                                  |
| **Rotate PDF**            | Rotate individual or all pages in a document.                              |
| **N-Up PDF**              | Combine multiple pages onto a single page.                                 |
| **View PDF**              | A powerful, integrated PDF viewer.                                         |
| **Alternate & Mix pages** | Merge pages by alternating pages from each PDF.                            |
| **Posterize PDF**         | Split a PDF into multiple smaller pages for print.                         |

### Edit & Modify PDFs

| Tool Name              | Description                                                 |
| :--------------------- | :---------------------------------------------------------- |
| **PDF Editor**         | A comprehensive editor to modify your PDFs.                 |
| **Add Page Numbers**   | Easily add page numbers with customizable formatting.       |
| **Add Watermark**      | Add text or image watermarks to protect your documents.     |
| **Header & Footer**    | Add customizable headers and footers.                       |
| **Crop PDF**           | Crop specific pages or the entire document.                 |
| **Invert Colors**      | Invert the colors of your PDF pages for better readability. |
| **Change Background**  | Modify the background color of your PDF.                    |
| **Change Text Color**  | Change the color of text content within the PDF.            |
| **Fill Forms**         | Fill out PDF forms directly in your browser.                |
| **Flatten PDF**        | Flatten form fields and annotations into static content.    |
| **Remove Annotations** | Remove comments, highlights, and other annotations.         |
| **Remove Blank Pages** | Auto detect and remove blank pages in a PDF.                |

### Convert to PDF

| Tool Name           | Description                                                     |
| :------------------ | :-------------------------------------------------------------- |
| **Image to PDF**    | Convert JPG, PNG, WebP, SVG, BMP, HEIC, and TIFF images to PDF. |
| **Markdown to PDF** | Convert `.md` files into professional PDF documents.            |
| **Text to PDF**     | Convert plain text files into a PDF.                            |

### Convert from PDF

| Tool Name            | Description                                                                    |
| :------------------- | :----------------------------------------------------------------------------- |
| **PDF to Image**     | Convert PDF pages to JPG, PNG, WebP, BMP, or TIFF formats.                     |
| **PDF to Greyscale** | Convert a color PDF into a black-and-white version.                            |
| **OCR PDF**          | Make scanned PDFs searchable and copyable using Optical Character Recognition. |

### Secure & Optimize PDFs

| Tool Name              | Description                                                        |
| :--------------------- | :----------------------------------------------------------------- |
| **Compress PDF**       | Reduce file size while maintaining quality.                        |
| **Repair PDF**         | Attempt to repair and recover data from a corrupted PDF.           |
| **Encrypt PDF**        | Add a password to protect your PDF from unauthorized access.       |
| **Decrypt PDF**        | Remove password protection from a PDF (password required).         |
| **Change Permissions** | Set or modify user permissions for printing, copying, and editing. |
| **Sign PDF**           | Add your digital signature to a document.                          |
| **Redact Content**     | Permanently remove sensitive content from your PDFs.               |
| **Edit Metadata**      | View and modify PDF metadata (author, title, keywords, etc.).      |
| **Remove Metadata**    | Strip all metadata from your PDF for privacy.                      |
| **Linearize PDF**      | Optimize PDF for fast web view.                                    |
| **Sanitize PDF**       | Remove potentially unwanted or malicous files from PDF.            |

---

## 🚀 Getting Started

You can run BentoPDF locally for development or personal use.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/install/) (for containerized setup)

### 🚀 Quick Start with Docker

You can run BentoPDF directly from Docker Hub without cloning the repository:

You can also watch the video on how to set it up 👉
[BentoPDF Docker Setup](https://drive.google.com/file/d/1C4eJ2nqeaH__1Tlad-xuBHaF2Ha4fSBf/view?usp=drive_link)

```bash
docker run -p 3000:8080 bentopdf/bentopdf:latest
```

Open your browser at: http://localhost:3000

This is the fastest way to try BentoPDF without setting up a development environment.

### 🚀 Run with Docker Compose (Recommended)

For a more robust setup with auto-restart capabilities:

1. **Download the repo and create a `docker-compose.yml` file or use the one given in repo**:

```yaml
services:
  bentopdf:
    image: bentopdf/bentopdf:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
```

2. **Start the application**:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

### 🏢 Simple Mode for Internal Use

For organizations that want a clean, distraction-free interface focused solely on PDF tools, BentoPDF supports a **Simple Mode** that hides all branding and marketing content.

**What Simple Mode does:**

- Hides navigation, hero section, features, FAQ, testimonials, and footer
- Shows only the essential PDF tools
- Updates page title to "PDF Tools"
- Perfect for internal company tools and educational institutions

For more details, see [SIMPLE_MODE.md](SIMPLE_MODE.md).

### 🔒 Security Features

BentoPDF runs as a non-root user using nginx-unprivileged for enhanced security:

- **Non-Root Execution**: Container runs with minimal privileges using nginx-unprivileged and allows for an arbitrary user (UID)
- **Port 8080**: Uses high port number to avoid requiring root privileges
- **Security Best Practices**: Follows Principle of Least Privilege

#### Basic Usage

```bash
docker build -t bentopdf .
docker run -p 8080:8080 bentopdf
```

For detailed security configuration, see [SECURITY.md](SECURITY.md).

### 📦 Version Management

BentoPDF supports semantic versioning with multiple Docker tags:

- **Latest**: `bentopdf/bentopdf:latest`
- **Specific Version**: `bentopdf/bentopdf:1.0.0`
- **Version with Prefix**: `bentopdf/bentopdf:v1.0.0`

#### Quick Release

```bash
# Release a patch version (0.0.1 → 0.0.2)
npm run release

# Release a minor version (0.0.1 → 0.1.0)
npm run release:minor

# Release a major version (0.0.1 → 1.0.0)
npm run release:major
```

For detailed release instructions, see [RELEASE.md](RELEASE.md).

### 🚀 Development Setup

#### Option 1: Run with npm

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

#### Option 2: Build and Run with Docker Compose

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf
   ```

2. **Run with Docker Compose**:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

   The application will be available at `http://localhost:3000`.

   > **Note:** After making any local changes to the code, rebuild the Docker image using:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build -d
   ```

   This ensures your latest changes are applied inside the container.

---

## 🛠️ Tech Stack & Background

BentoPDF was originally built using **HTML**, **CSS**, and **vanilla JavaScript**. As the project grew, it was migrated to a modern stack for better maintainability and scalability:

- **Vite**: A fast build tool for modern web development.
- **TypeScript**: For type safety and an improved developer experience.
- **Tailwind CSS**: For rapid and consistent UI development.

> **Note:** Some parts of the codebase still use legacy structures from the original implementation. Contributors should expect gradual updates as testing and refactoring continue.

---

## 🗺️ Roadmap

### Planned Features:

- **HTML to PDF**: Convert HTML files or web pages into PDF documents.
- **Markdown to PDF**: Enhanced support for converting `.md` files to PDF.
- **Convert to PDF/A**: Convert PDFs to the PDF/A archival format.
- **Edit PDF Content**: Directly edit text and other content within your PDF.
- **PDF to Office**: Converts PDF files into editable Word, Excel, and PowerPoint formats.
- **Office to PDF**: Converts Word, Excel, and PowerPoint documents into optimized PDFs.

Contributions and discussions on the roadmap are welcome! Join the conversation via [Discord](https://discord.gg/AP2Y97juZT).

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get started:

1.  **Fork the repository** and create your branch from `main`.
2.  Follow the **Getting Started** steps to set up your local environment.
3.  Make your changes and commit them with a clear message.
4.  **Open a Pull Request** and describe the changes you've made.

Have an idea for a new tool or an improvement? [Open an issue](https://github.com/alam00000/bentopdf/issues) to discuss it first.

---

## Special Thanks

BentoPDF wouldn't be possible without the amazing open-source tools and libraries that power it. We'd like to extend our heartfelt thanks to the creators and maintainers of:

- **[PDFLib.js](https://pdf-lib.js.org/)** – For enabling powerful client-side PDF manipulation.
- **[PDF.js](https://mozilla.github.io/pdf.js/)** – For the robust PDF rendering engine in the browser.
- **[PDFKit](https://pdfkit.org/)** – For creating and editing PDFs with ease.
- **[EmbedPDF](https://github.com/embedpdf/embed-pdf-viewer)** – For seamless PDF editing in pure JS.
- **[Cropper.js](https://fengyuanchen.github.io/cropperjs/)** – For intuitive image cropping functionality.
- **[Vite](https://vitejs.dev/)** – For lightning-fast development and build tooling.
- **[Tailwind CSS](https://tailwindcss.com/)** – For rapid, flexible, and beautiful UI styling.
- **[qpdf](https://github.com/qpdf/qpdf)** and **[qpdf-wasm](https://github.com/neslinesli93/qpdf-wasm)**– A powerful command-line tool and library for inspecting, repairing, and transforming PDF file ported to wasm

Your work inspires and empowers developers everywhere. Thank you for making open-source amazing!

## 📜 License

This project is licensed under the **GNU AGPLv3**. See the [LICENSE](https://github.com/alam00000/bentopdf/blob/main/LICENSE) file for details.
