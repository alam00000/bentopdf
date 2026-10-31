---
title: Trình xây dựng quy trình PDF
description: Xây dựng quy trình xử lý PDF tùy chỉnh một cách trực quan bằng cách nối các nút trên canvas. Kết hợp các thao tác như gộp, nén, watermark và xuất.
---

# Trình xây dựng quy trình PDF

Trình xây dựng quy trình cho phép bạn nối nhiều thao tác PDF thành một quy trình tự động duy nhất. Thay vì chạy từng công cụ một, bạn nối một đồ thị trực quan gồm các nút (đầu vào, xử lý, đầu ra) và thực thi tất cả chỉ với một cú nhấp. Tệp của bạn không bao giờ rời khỏi trình duyệt.

## Cách hoạt động

Giao diện chia thành ba bảng: **hộp công cụ nút** ở bên trái, **canvas** ở giữa và **bảng cài đặt** ở bên phải xuất hiện khi bạn chọn một nút.

1. **Thêm nút** bằng cách nhấp vào chúng ở thanh bên trái, hoặc kéo trực tiếp lên canvas. Dùng thanh tìm kiếm ở đầu hộp công cụ để lọc theo tên.
2. **Nối các nút** bằng cách kéo từ ổ cắm đầu ra (cuối nút) tới ổ cắm đầu vào (đầu nút khác). Kết nối chạy từ trên xuống dưới.
3. **Cấu hình cài đặt** bằng cách nhấp vào một nút để mở bảng cài đặt ở bên phải. Mỗi loại nút có tùy chọn riêng (phạm vi trang, thanh trượt chất lượng, mật khẩu, v.v.).
4. **Chạy quy trình** bằng cách nhấp nút **Chạy** trên thanh công cụ. Engine thực thi các nút theo thứ tự tô-pô, xử lý lần lượt từng nút. Thanh trạng thái ở dưới cùng theo dõi tiến trình.
5. **Tải xuống kết quả**: nút Tải xuống cuối cùng lưu PDF kết quả (hoặc ZIP nếu tạo ra nhiều tệp).

## Các nhóm nút

Các nút được tổ chức thành sáu nhóm, mỗi nhóm có màu riêng trên canvas:

- **Đầu vào** (xanh dương): Nhập PDF, Đầu vào hình ảnh, Word/Excel/PowerPoint sang PDF và hơn 15 bộ chuyển đổi định dạng khác đưa tệp vào quy trình.
- **Chỉnh sửa & Chú thích** (chàm): Cắt PDF, PDF sang thang xám, Đảo ngược màu, Thêm Watermark, Số trang, Đầu trang & Chân trang, Hiệu ứng máy quét, Điều chỉnh màu sắc, Màu nền, Xóa trang trống, Xóa ghi chú.
- **Sắp xếp & Quản lý** (tím): Gộp PDF, Chia PDF, Trích xuất trang, Xoay PDF, Xóa trang, Đảo ngược trang, Thêm trang trống, Chia trang, N-Up PDF, Sửa kích thước trang, Kết hợp thành một trang, Sách nhỏ PDF, Chia PDF thành poster, Chỉnh sửa Metadata, Mục lục, OCR PDF.
- **Tối ưu & Sửa chữa** (hổ phách): Nén PDF, Raster hóa PDF, Tuyến tính hóa PDF, Chỉnh nghiêng PDF, PDF sang PDF/A, Phông chữ thành đường viền, Sửa chữa PDF.
- **Bảo mật PDF** (hồng): Mã hóa, Giải mã, Làm sạch PDF, Làm phẳng PDF, Ký số, Che nội dung.
- **Đầu ra** (xanh mòng két): Tải xuống (tự động nhận biết một PDF hay ZIP), PDF sang hình ảnh, PDF sang văn bản, PDF sang DOCX, PDF sang XLSX, PDF sang CSV, PDF sang SVG, PDF sang Markdown, Trích xuất hình ảnh.

## Lưu và tải quy trình

Thanh công cụ cung cấp bốn tùy chọn lưu trữ:

- **Lưu**: lưu quy trình hiện tại thành mẫu có tên trong bộ nhớ cục bộ của trình duyệt. Bạn có thể lưu nhiều mẫu.
- **Tải**: mở hộp thoại liệt kê tất cả mẫu đã lưu. Nhấp Tải để khôi phục một mẫu, hoặc xóa những mẫu bạn không còn cần.
- **Xuất**: tải quy trình xuống dưới dạng tệp `.json` để bạn chia sẻ hoặc sao lưu.
- **Nhập**: tải tệp quy trình `.json` từ ổ đĩa, khôi phục toàn bộ nút, vị trí và kết nối.

Các mẫu được giữ lại qua các phiên trong bộ nhớ cục bộ. Tệp JSON đã xuất có thể chuyển giữa các trình duyệt và máy.

## Mô hình thực thi

Engine xây dựng đồ thị phụ thuộc từ các kết nối của bạn và thực thi các nút theo thứ tự tô-pô. Nếu một nút thất bại, quá trình thực thi dừng lại và nút lỗi được đánh dấu màu đỏ. Một vài quy tắc cần nhớ:

- Mọi quy trình cần ít nhất một nút **Đầu vào** và một nút **Đầu ra**.
- Engine phát hiện phụ thuộc vòng và chặn thực thi kèm thông báo lỗi.
- Nút **Mã hóa** phải là bước xử lý cuối cùng trước nút đầu ra. Đặt nó sớm hơn sẽ gây cảnh báo xác thực vì các nút phía sau không thể xử lý dữ liệu đã mã hóa.
- PDF được bảo vệ bằng mật khẩu sẽ yêu cầu nhập mật khẩu trong lúc thực thi.
- Hỗ trợ đầu vào nhiều PDF: nút Gộp PDF có thể kết hợp chúng, hoặc các nút xử lý hàng loạt sẽ xử lý từng PDF riêng.

## Các loại ổ cắm

Kết nối dùng ổ cắm có kiểu để ngăn nối sai:

- **PDF** (chàm): một tài liệu PDF.
- **MultiPDF** (hổ phách): nhiều tài liệu PDF được gộp lại.
- **Image** (xanh lá): một blob hình ảnh.

## Tùy chọn

Mỗi nút có cấu hình riêng, truy cập qua bảng cài đặt bên phải. Một số mẫu thường gặp:

- **Phạm vi trang** ở các nút Chia PDF, Trích xuất trang, Xóa trang
- **Thanh trượt chất lượng** ở các nút đầu ra chuyển đổi hình ảnh
- **Trường mật khẩu** ở các nút Mã hóa và Giải mã
- **Ô nhập văn bản** cho Thêm Watermark, Đầu trang & Chân trang, Chỉnh sửa Metadata
- **Góc xoay** ở nút Xoay PDF
- **Mức nén** ở nút Nén PDF
- **Chọn ngôn ngữ OCR** ở nút OCR PDF

## Trường hợp sử dụng

- **Quy trình xử lý hóa đơn**: Nhập PDF -> OCR PDF -> Trích xuất bảng PDF -> Tải xuống dưới dạng CSV.
- **Chuẩn hóa báo cáo**: Word sang PDF -> Sửa kích thước trang -> Số trang -> Thêm Watermark -> Nén PDF -> Tải xuống.
- **Chuẩn bị lưu trữ**: Nhập PDF -> Sửa chữa PDF -> Làm phẳng PDF -> Làm sạch PDF -> PDF sang PDF/A -> Tải xuống.
- **Trích xuất hình ảnh hàng loạt**: Nhập PDF (nhiều tệp) -> Trích xuất hình ảnh -> Tải xuống ZIP.
- **Sách nhỏ sẵn sàng in**: Nhập PDF -> Sách nhỏ PDF -> Cắt PDF -> Nén PDF -> Tải xuống.
- **Phân phối an toàn**: Nhập PDF -> Che nội dung -> Xóa ghi chú -> Mã hóa -> Tải xuống.

## Mẹo

- Dùng **Delete** hoặc **Backspace** để xóa nút đang chọn khỏi canvas.
- Nhấp nút **X** trên thanh trạng thái của nút để xóa nó trực tiếp.
- Kéo canvas bằng cách nhấp và kéo trên vùng trống. Con trỏ đổi thành biểu tượng bàn tay nắm khi kéo.
- Trên di động, dùng nút **+** trên thanh công cụ để bật tắt hộp công cụ nút.
- Nếu quy trình tạo ra nhiều tệp đầu ra, nút Tải xuống tự động gói chúng thành ZIP.
- Hãy bắt đầu đơn giản: xây dựng và thử quy trình hai nút trước khi thêm độ phức tạp.

## Công cụ liên quan

- [PDF sang Văn bản](./pdf-to-text)
- [PDF sang Excel](./pdf-to-excel)
- [Trích xuất hình ảnh](./extract-images)
- [PDF sang Markdown](./pdf-to-markdown)
