# Contributing to BentoPDF

First off, thank you for considering contributing to **BentoPDF**! Your help makes this project better for everyone.

This document outlines how to contribute, report issues, and get involved in the project.

---

## Contributor License Agreement (CLA)

Before we can accept your contributions, you must sign our Contributor License Agreement (CLA). This is required because BentoPDF uses a dual licensing model:

- **AGPL-3.0** for open source use
- **Commercial license** for proprietary use

The CLA ensures we can include your contributions in both versions of the project.

### For Individual Contributors

Sign our [Individual Contributor License Agreement (ICLA)](ICLA.md). When you submit your first pull request, the CLA Assistant bot will automatically ask you to sign by commenting on the PR.

### For Corporate Contributors

If you are contributing on behalf of your employer, your organization needs to sign our [Corporate Contributor License Agreement (CCLA)](CCLA.md). Please contact us at [contact@bentopdf.com](mailto:contact@bentopdf.com) to arrange corporate CLA signing.

### What the CLA Grants

By signing the CLA, you:

- Grant us a broad copyright license to use, modify, and relicense your contributions (including for commercial use)
- Grant a patent license for any patents covering your contribution
- Represent that you have the authority to make the contribution
- Retain full copyright ownership of your contributions

---

## 1. How to Contribute

You can contribute in several ways:

- **Reporting Bugs:** If you find a bug or unexpected behavior, please open an issue. Include steps to reproduce and any relevant screenshots or logs.
- **Feature Requests:** Suggest new features or improvements by opening an issue and describing your idea clearly.
- **Code Contributions:** Submit a pull request with new features, bug fixes, or improvements.
- **Documentation:** Help improve the README, usage examples, or guides.
- **Testing:** Help test new releases or changes to ensure stability.

---

### Issue Template

When reporting bugs, requesting features, or asking questions, please use our [issue template](.github/ISSUE_TEMPLATE/bug_feature_question.md). The template will automatically appear when you create a new issue.

**Our issue template helps you provide:**

- Clear categorization (Bug, Feature Request, or Question)
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details
- Screenshots or logs

**Title Format Examples:**

- `(Bug) Text alignment incorrect on multi-line paragraphs`
- `(Feature) Add support for custom PDF metadata`
- `(Question) How to embed custom fonts?`

### Pull Request Template

When submitting code contributions, please use our [pull request template](.github/pull_request_template.md). The template will automatically appear when you create a new PR.

**Key requirements:**

- Link to the related issue (e.g., `Fixes #123`)
- Describe the type of change (bug fix, feature, breaking change)
- Explain how you tested your changes
- Complete the checklist before submitting

## 2. Getting Started with Code Contributions

1.  **Fork the Repository**

    ```bash
    git clone https://github.com/alam00000/bentopdf.git
    cd bento-pdf
    npm install
    ```

2.  **Create a New Branch**

    ```bash
    git checkout -b feature/my-new-feature
    ```

3.  **Make Your Changes**
    - Follow the code style and conventions used in the project.
    - Add comments where necessary.
    - Update or add tests if applicable.

4.  **Run Tests**

    ```bash
    npm run test
    ```

5.  **Commit Your Changes**

    ```bash
    git add .
    git commit -m "Add a meaningful commit message"
    ```

6.  **Push and Submit a Pull Request**

    ```bash
    git push origin feature/my-new-feature
    ```

    - Open a pull request on GitHub and provide a clear description of your changes.

---

## 3. Code Style

- Follow the existing TypeScript and JavaScript conventions.
- Use `camelCase` for variables and functions.
- Keep lines reasonably short and readable.
- Comment complex logic for clarity.

---

## 4. Issues and Pull Requests

- Make sure your PR is focused and addresses a single issue or feature.
- Reference related issues in your PR description (e.g., `Closes #12`).
- Be responsive to feedback and make requested changes promptly.

---

## 5. Reporting Security Issues

If you discover a security vulnerability, please **do not** open a public issue. Instead, contact the project maintainer directly at:

**Email:** [contact@bentopdf.com](mailto:contact@bentopdf.com)

---

## 6. Code of Conduct

All contributors are expected to follow the Code of Conduct. Be respectful and considerate in all communications.

---

Thank you for helping make **BentoPDF** a better library for everyone!
