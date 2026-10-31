---
title: Nén PDF
description: Giảm dung lượng tệp PDF tới 90% với engine Hyper Compress. Hỗ trợ kích thước tệp mục tiêu, xử lý hàng loạt và cài đặt chất lượng tùy chỉnh.
---

# Nén PDF

Thu nhỏ tệp PDF mà không làm hỏng chúng. Nén PDF được cung cấp bởi [Hyper Compress](https://www.bentopdf.com/hyper-compress), engine nén riêng của BentoPDF. Nó nén lại hình ảnh, tạo tập con và gộp phông chữ, đồng thời loại bỏ phần dư thừa như ảnh thu nhỏ nhúng sẵn và dữ liệu riêng của ứng dụng. PDF vẫn hoạt động đầy đủ: văn bản vẫn chọn được, liên kết và trường biểu mẫu vẫn dùng được.

Hyper Compress được biên dịch sang WebAssembly và đi kèm BentoPDF, nên việc nén hoạt động offline và trong các môi trường triển khai cách ly mạng mà không cần thiết lập thêm.

## Cách hoạt động

1. Tải lên một hoặc nhiều PDF bằng cách nhấp vào vùng thả hoặc kéo tệp vào.
2. Chọn **Mức nén**: Thấp, Trung bình, Cao hoặc Không mất dữ liệu.
3. Có thể nhập **Kích thước tệp mục tiêu**, hoặc mở **Cài đặt tùy chỉnh** để điều chỉnh chi tiết, gồm cả **Chuyển sang thang xám**.
4. Nhấp **Nén PDF**. Với nhiều tệp, bạn nhận được một tệp ZIP duy nhất để tải xuống.

## Tài liệu đặc biệt

- **PDF có chữ ký số** được trả về nguyên vẹn, vì mọi thay đổi đều làm mất hiệu lực chữ ký. Bật **Ghi đè bảo vệ nội dung** trong Cài đặt tùy chỉnh để gỡ chữ ký và nén chúng; chữ ký hiển thị vẫn nằm trên trang, nhưng tệp không còn được ký.
- **Tệp PDF/A** mất nhãn PDF/A sau khi nén, để tệp không bao giờ tuyên bố một mức tuân thủ mà nó không còn đáp ứng. Bật **Giữ PDF/A** trong Cài đặt tùy chỉnh để giữ tệp tuân thủ.
- **PDF có mật khẩu** có ô nhập mật khẩu trên thẻ tệp. Nhập mật khẩu ở đó và Hyper Compress tự mở tệp, không cần bước giải mã riêng. Với hai tệp bị khóa trở lên, một ô dùng chung sẽ mở khóa mọi tệp có cùng mật khẩu. Bản đã nén không có mật khẩu; hãy dùng [Mã hóa PDF](./protect-pdf) để thêm lại.
- **Bản quét không có lớp văn bản** có thể nhỏ hơn nữa với **Raster hóa trang** trong Cài đặt tùy chỉnh, thay mỗi trang bằng một hình ảnh đã tối ưu. Tùy chọn này bị bỏ qua với mọi tài liệu có văn bản chọn được, kể cả bản quét đã qua OCR, trừ khi **Ghi đè bảo vệ nội dung** đang bật. Khi đó các trang văn bản cũng thành hình ảnh, nên văn bản không còn chọn được và liên kết ngừng hoạt động.

## Mức nén

| Mức                   | Chất lượng hình ảnh | Độ phân giải tối đa | Phù hợp nhất cho                |
| --------------------- | ------------------- | ------------------- | ------------------------------- |
| **Thấp**              | 80                  | 200 DPI             | Giữ chất lượng hình ảnh         |
| **Trung bình**        | 50                  | 150 DPI             | Tài liệu hằng ngày              |
| **Cao**               | 20                  | 72 DPI              | Tệp đính kèm email, tải lên web |
| **Không mất dữ liệu** | Hình ảnh giữ nguyên | Không đổi           | Bản lưu trữ                     |

Mức Cao còn gỡ nhúng 14 phông chữ PDF tiêu chuẩn, cùng các phông tương tự như Arial khi an toàn.

## Kích thước tệp mục tiêu

Nhập kích thước theo KB hoặc MB và Hyper Compress sẽ tìm chất lượng hình ảnh tốt nhất vẫn vừa kích thước đó, bắt đầu từ mức bạn đã chọn. Nếu tài liệu không thể nhỏ đến vậy, bạn nhận được phiên bản nhỏ nhất có thể cùng một thông báo cho biết điều đó. Các trang chuyên biệt như [Nén PDF xuống 1MB](https://www.bentopdf.com/compress-pdf-to-1mb) mở ra với mục tiêu đã được điền sẵn.

## Cài đặt tùy chỉnh

Mở bảng Cài đặt tùy chỉnh để điều chỉnh trực tiếp Hyper Compress. Chọn một mức nén sẽ đặt lại các giá trị này về giá trị của mức đó, và chỉnh sửa bất kỳ giá trị nào sẽ chuyển mức sang Tùy chỉnh.

- **Ghi đè bảo vệ nội dung**: theo mặc định Hyper Compress không động đến PDF đã ký và không raster hóa các trang có văn bản. Bật tùy chọn này sẽ bỏ qua cả hai. Nó vẫn bật khi bạn đổi mức.

- **Hình ảnh**: chất lượng hình ảnh, độ phân giải tối đa, buộc lấy mẫu lại, giảm màu, cắt các vùng ảnh vô hình, xóa ảnh thay thế, đơn giản hóa hồ sơ màu, JPEG 2000 và chế độ không mất dữ liệu
- **Phông chữ**: tạo tập con, gộp bản trùng và gỡ nhúng phông chuẩn cùng các phông tương tự
- **Nội dung**: làm phẳng chú thích, trường biểu mẫu hoặc liên kết
- **Dọn dẹp**: xóa ảnh thu nhỏ, dữ liệu ứng dụng, article thread, thông tin chụp web, cây cấu trúc hoặc output intent
- **Raster hóa**: thay trang bằng hình ảnh, cho bản quét chỉ có ảnh; bị bỏ qua khi tài liệu có văn bản chọn được
- **Đầu ra**: Giữ PDF/A, và nén Brotli cho trình đọc PDF 2.0 có hỗ trợ

## Trường hợp sử dụng

- Đưa báo cáo 50 MB xuống dưới giới hạn tệp đính kèm email
- Đưa bản quét xuống dưới giới hạn tải lên nghiêm ngặt của một cổng thông tin bằng kích thước tệp mục tiêu
- Tối ưu PDF tiếp thị để tải xuống từ website nhanh hơn
- Lưu trữ bộ tài liệu lớn khi chi phí lưu trữ là vấn đề
- Giảm lưu lượng dữ liệu di động khi chia sẻ PDF qua ứng dụng nhắn tin

## Mẹo

- Bắt đầu với Trung bình. Nếu kết quả vẫn quá lớn, hãy đặt kích thước tệp mục tiêu hoặc tăng lên Cao.
- Với bản quét không có lớp văn bản, hãy bật Raster hóa trang trong Cài đặt tùy chỉnh.
- Chuyển sang thang xám, trong Cài đặt tùy chỉnh, có thể giảm dung lượng với tài liệu nhiều màu.

## Công cụ liên quan

- [Tuyến tính hóa PDF](./linearize-pdf): tối ưu PDF đã nén để xem web nhanh
- [Raster hóa PDF](./rasterize-pdf): chuyển trang thành hình ảnh ở DPI cụ thể, kể cả trang có văn bản
- [Sửa chữa PDF](./repair-pdf): sửa PDF bị hỏng trong quá trình nén ở nơi khác
- [Xóa metadata](./remove-metadata): loại bỏ dữ liệu ẩn để bảo vệ quyền riêng tư
