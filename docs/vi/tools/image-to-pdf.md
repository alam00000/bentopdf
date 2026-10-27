---
title: Hình ảnh sang PDF
description: Chuyển đổi JPG, PNG, BMP, GIF, TIFF, SVG, HEIC, WebP, PSD và hơn 10 định dạng ảnh khác thành một tệp PDF duy nhất.
---

# Hình ảnh sang PDF

Bộ chuyển đổi ảnh sang PDF đa năng. Tải lên ảnh ở hầu hết mọi định dạng và gộp chúng thành một tài liệu PDF. Mỗi ảnh nằm trên một trang riêng, có kích thước khớp với kích thước gốc.

## Định dạng được hỗ trợ

| Định dạng       | Phần mở rộng                           |
| :-------------- | :------------------------------------- |
| JPEG            | `.jpg`, `.jpeg`                        |
| JPEG 2000       | `.jp2`, `.jpx`                         |
| PNG             | `.png`                                 |
| BMP             | `.bmp`                                 |
| GIF             | `.gif`                                 |
| TIFF            | `.tiff`, `.tif`                        |
| SVG             | `.svg`                                 |
| HEIC/HEIF       | `.heic`, `.heif`                       |
| WebP            | `.webp`                                |
| PSD             | `.psd`                                 |
| Portable Anymap | `.pnm`, `.pgm`, `.pbm`, `.ppm`, `.pam` |
| JPEG XR         | `.jxr`                                 |

Đây là phạm vi hỗ trợ định dạng rộng nhất trong số các bộ chuyển đổi ảnh của BentoPDF. Nếu bạn chỉ cần một định dạng cụ thể, hãy dùng công cụ chuyên biệt tương ứng.

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp ảnh của bạn. Có thể chọn nhiều tệp cùng lúc.
2. Xem lại danh sách tệp. Xóa tệp không cần bằng biểu tượng thùng rác, hoặc nhấp **Thêm tệp** để bổ sung ảnh.
3. Chọn mức **Chất lượng PDF** từ danh sách thả xuống.
4. Nhấp **Chuyển sang PDF**. Công cụ xử lý ảnh qua engine PyMuPDF và tải kết quả xuống với tên `images_to_pdf.pdf`.

## Tùy chọn

**Chất lượng PDF** điều khiển mức nén ảnh áp dụng khi nhúng ảnh vào PDF:

- **Chất lượng cao**: nén tối thiểu, dung lượng tệp lớn hơn. Phù hợp nhất để in hoặc lưu trữ.
- **Chất lượng trung bình** (mặc định): nén cân bằng. Tốt cho hầu hết mục đích.
- **Chất lượng thấp**: nén mạnh, dung lượng nhỏ nhất. Phù hợp để gửi email hoặc chia sẻ nhanh.

Tệp HEIC và WebP được tự động chuyển thành PNG trước khi nhúng. Việc này diễn ra trong suốt và không cần thêm bước nào.

## Trường hợp sử dụng

- Gộp hóa đơn hoặc tài liệu quét từ camera điện thoại thành một PDF
- Tạo hồ sơ ảnh hoặc lookbook từ các ảnh nhiều định dạng
- Chuyển ảnh iPhone (HEIC) thành PDF có thể chia sẻ mà không cần cài phần mềm máy tính
- Tập hợp bản mockup thiết kế từ tệp PSD xuất ra và ảnh chụp màn hình thành sản phẩm bàn giao cho khách hàng
- Lưu trữ một thư mục các định dạng ảnh cũ (PNM, JXR, JP2) thành một PDF duy nhất

## Mẹo

- Thứ tự ảnh trong PDF khớp với thứ tự trong danh sách tệp. Hãy tải lên theo đúng thứ tự bạn muốn.
- Để có dung lượng tệp nhỏ nhất, hãy chọn Chất lượng thấp. Sự khác biệt về hình ảnh thường không đáng kể với các bản quét nhiều chữ.
- Nếu bạn chỉ có một định dạng ảnh, các bộ chuyển đổi chuyên biệt (JPG sang PDF, PNG sang PDF, v.v.) cho cùng kết quả với giao diện đơn giản hơn.

## Công cụ liên quan

- [JPG sang PDF](./jpg-to-pdf)
- [PNG sang PDF](./png-to-pdf)
- [HEIC sang PDF](./heic-to-pdf)
- [WebP sang PDF](./webp-to-pdf)
