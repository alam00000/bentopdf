---
title: CBZ sang PDF
description: Chuyển đổi kho lưu trữ truyện tranh CBZ và CBR sang PDF ngay trong trình duyệt. Miễn phí, riêng tư, không cần tải lên.
---

# CBZ sang PDF

Biến các tệp lưu trữ truyện tranh thành PDF. CBZ và CBR là định dạng tiêu chuẩn của truyện tranh kỹ thuật số: thực chất chúng chỉ là kho lưu trữ ZIP hoặc RAR chứa đầy hình ảnh. Công cụ này trích xuất từng trang, giữ nguyên thứ tự đọc và tạo ra một PDF gọn gàng, trong đó mỗi hình ảnh trở thành một trang kích thước đầy đủ.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng | Ghi chú                                                   |
| :-------- | :----------- | :-------------------------------------------------------- |
| CBZ       | `.cbz`       | Kho truyện tranh dựa trên ZIP (xử lý cục bộ bằng pdf-lib) |
| CBR       | `.cbr`       | Kho truyện tranh dựa trên RAR (xử lý qua engine PyMuPDF)  |

Trình chuyển đổi CBZ nhận dạng các hình ảnh JPEG, PNG, GIF, BMP, WebP, AVIF, TIFF, HEIC và JXL trong kho lưu trữ. Các định dạng không chuẩn được tự động chuyển sang PNG trước khi nhúng.

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo thả các tệp CBZ hoặc CBR. Bạn có thể trộn cả hai định dạng trong một lô.
2. Xem lại danh sách tệp. Xóa những tệp không cần, hoặc nhấp **Thêm tệp** để thêm nữa.
3. Nhấp **Chuyển đổi sang PDF**. Với tệp CBZ, công cụ giải nén kho lưu trữ, sắp xếp các tệp hình ảnh theo tên theo thứ tự tự nhiên, phát hiện định dạng thực của từng hình ảnh, rồi nhúng chúng vào PDF bằng pdf-lib. Tệp CBR được chuyển qua engine PyMuPDF.
4. Một tệp sẽ được tải xuống dưới dạng PDF. Nhiều tệp sẽ tạo ra một kho ZIP tên là `comic-converted.zip`.

## Tùy chọn

Không cần cấu hình. Mỗi hình ảnh trở thành một trang có kích thước khớp với kích thước gốc, nên các trang đôi vẫn rộng và các trang đơn vẫn hẹp.

## Trường hợp sử dụng

- Đọc truyện tranh trên máy tính bảng hoặc ứng dụng điện thoại hỗ trợ PDF nhưng không hỗ trợ CBZ/CBR
- In một số trang cụ thể từ truyện tranh kỹ thuật số
- Lưu trữ bộ sưu tập truyện tranh ở định dạng mà trình xem tệp nào cũng mở được
- Chia sẻ truyện tranh với người không có trình đọc truyện chuyên dụng

## Mẹo

- Hình ảnh trong kho lưu trữ được sắp xếp theo thứ tự tự nhiên (nên `page2.jpg` đứng trước `page10.jpg`). Hãy đặt tên tệp với cách đánh số nhất quán để có thứ tự trang đúng.
- Trình chuyển đổi phát hiện định dạng hình ảnh bằng chữ ký nhị phân, không dựa vào phần mở rộng tệp. Một tệp PNG vô tình đặt tên `.jpg` vẫn được nhúng đúng.
- Tệp CBZ được xử lý hoàn toàn trong trình duyệt mà không cần tải engine PyMuPDF, nên chuyển đổi nhanh hơn tệp CBR.

## Công cụ liên quan

- [EPUB sang PDF](./epub-to-pdf)
- [MOBI sang PDF](./mobi-to-pdf)
- [Hình ảnh sang PDF](./image-to-pdf)
