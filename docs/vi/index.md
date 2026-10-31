---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'BentoPDF'
  text: 'Công cụ PDF miễn phí, mã nguồn mở'
  tagline: Xử lý PDF hoàn toàn trong trình duyệt của bạn. Không tải lên. Không máy chủ. Riêng tư tuyệt đối.
  actions:
    - theme: brand
      text: Bắt đầu
      link: /vi/getting-started
    - theme: alt
      text: Xem công cụ
      link: /vi/tools/
    - theme: alt
      text: Tự lưu trữ
      link: /vi/self-hosting/
    - theme: alt
      text: Giấy phép thương mại
      link: /vi/licensing

features:
  - icon: 🔒
    title: Riêng tư 100%
    details: Tệp của bạn không bao giờ rời khỏi thiết bị. Mọi xử lý diễn ra cục bộ trong trình duyệt bằng WebAssembly.
  - icon: ⚡
    title: Nhanh và miễn phí
    details: Không đăng ký, không giới hạn, không hình mờ. Xử lý không giới hạn PDF miễn phí, mãi mãi.
  - icon: 🛠️
    title: Hơn 50 công cụ
    details: Chuyển đổi, chỉnh sửa, gộp, chia, nén, ký, OCR và hơn thế nữa. Mọi thứ bạn cần ở cùng một nơi.

  - icon: 🌐
    title: Có thể tự lưu trữ
    details: Triển khai trên hạ tầng của riêng bạn. Docker, Vercel, Netlify, AWS, hoặc môi trường air-gapped hoàn toàn với worker OCR, dữ liệu ngôn ngữ và phông chữ lớp văn bản tự lưu trữ.
---

## OCR ngoại tuyến

Nếu bạn tự lưu trữ BentoPDF trong môi trường air-gapped hoặc ngoại tuyến, OCR cần nhiều hơn tệp worker Tesseract và các tệp traineddata. Đầu ra PDF có thể tìm kiếm còn cần các phông chữ lớp văn bản OCR được phục vụ nội bộ.
Xem [Tự lưu trữ](/vi/self-hosting/) để biết cách thiết lập đầy đủ, gồm `VITE_OCR_FONT_BASE_URL`, thư mục `ocr-fonts/` đi kèm và quy trình air-gap đã cập nhật.
