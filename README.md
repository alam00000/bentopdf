# BentoPDF

![Docker Pulls](https://img.shields.io/docker/pulls/bentopdf/bentopdf)
[![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20Coffee-yellow?logo=kofi&style=flat-square)](https://ko-fi.com/alio0)

**BentoPDF** is a powerful, privacy-first, client-side PDF toolkit that allows you to manipulate, edit, merge, and process PDF files directly in your browser. No server-side processing is required, ensuring your files remain secure and private.

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

| Tool Name          | Description                                                                |
| :----------------- | :------------------------------------------------------------------------- |
| **Merge PDFs**     | Combine multiple PDF files into one.                                       |
| **Split PDFs**     | Extract specific pages or divide a document into smaller files.            |
| **Organize Pages** | Reorder, duplicate, or delete pages with a simple drag-and-drop interface. |
| **Extract Pages**  | Save a specific range of pages as a new PDF.                               |
| **Delete Pages**   | Remove unwanted pages from your document.                                  |
| **Rotate PDF**     | Rotate individual or all pages in a document.                              |
| **N-Up PDF**       | Combine multiple pages onto a single page.                                 |
| **View PDF**       | A powerful, integrated PDF viewer.                                         |

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

---

## 🚀 Getting Started

You can run BentoPDF locally for development or personal use.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/install/) (for containerized setup)

### 🚀 Run BentoPDF with Docker (Quick Start)

You can run BentoPDF directly from Docker Hub without cloning the repository:

```bash
docker pull bentopdf/bentopdf:latest
docker run -p 3000:80 bentopdf/bentopdf:latest
```

Open your browser at: http://localhost:3000.
This is the fastest way to try BentoPDF without setting up a development environment.

### 🚀 Installation with npm

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/alam00000/bentopdf.git
    cd bentopdf
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### 🚀 Running with Docker Compose Locally

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/alam00000/bentopdf.git
    cd bentopdf
    ```

2.  **Run with Docker Compose**:
    Create a `docker-compose.yml` file with the content provided in the repository or use the existing one. Then, run:

    ```bash
    docker-compose up -d
    ```

    The application will be available at `http://localhost:3000`.

    > **Note:** After making any local changes to the code, it’s recommended to rebuild the Docker image using:

    ```bash
    docker-compose up --build -d
    ```

    This ensures your latest changes are applied inside the container

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
- **Sanitize PDF**: Remove potentially malicious content like scripts from PDFs.
- **Convert to PDF/A**: Convert PDFs to the PDF/A archival format.
- **Edit PDF Content**: Directly edit text and other content within your PDF.
- **Linearize PDF**: Optimize PDFs for fast web viewing.

Contributions and discussions on the roadmap are welcome! Join the conversation via [Discord](https://discord.gg/q42xWQmJ).

---

## 🤝 Contributing

We welcome contributions from the community! Here’s how you can get started:

1.  **Fork the repository** and create your branch from `main`.
2.  Follow the **Getting Started** steps to set up your local environment.
3.  Make your changes and commit them with a clear message.
4.  **Open a Pull Request** and describe the changes you've made.

Have an idea for a new tool or an improvement? [Open an issue](https://github.com/alam00000/bentopdf/issues) to discuss it first.

---

## Special Thanks

BentoPDF wouldn’t be possible without the amazing open-source tools and libraries that power it. We’d like to extend our heartfelt thanks to the creators and maintainers of:

- **[PDFLib.js](https://pdf-lib.js.org/)** – For enabling powerful client-side PDF manipulation.
- **[PDF.js](https://mozilla.github.io/pdf.js/)** – For the robust PDF rendering engine in the browser.
- **[PDFKit](https://pdfkit.org/)** – For creating and editing PDFs with ease.
- **[EmbedPDF](https://github.com/embedpdf/embed-pdf-viewer)** – For seamless PDF embedding in web pages.
- **[Cropper.js](https://fengyuanchen.github.io/cropperjs/)** – For intuitive image cropping functionality.
- **[Vite](https://vitejs.dev/)** – For lightning-fast development and build tooling.
- **[Tailwind CSS](https://tailwindcss.com/)** – For rapid, flexible, and beautiful UI styling.

Your work inspires and empowers developers everywhere. Thank you for making open-source amazing!

## 📜 License

This project is licensed under the **Apache 2.0**. See the [LICENSE](https://github.com/alam00000/bentopdf/blob/main/LICENSE) file for details.
