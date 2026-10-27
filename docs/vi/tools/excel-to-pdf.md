---
title: Excel sang PDF
description: Chuyển đổi bảng tính Excel (XLS, XLSX), ODS và CSV sang PDF với định dạng được giữ nguyên.
---

# Excel sang PDF

Chuyển đổi tệp bảng tính sang PDF. Công cụ xử lý tệp Excel hiện đại, định dạng XLS cũ, bảng tính OpenDocument, thậm chí cả CSV, tất cả được kết xuất qua engine LibreOffice chạy trong trình duyệt, giữ nguyên định dạng ô, công thức (dưới dạng giá trị đã tính), biểu đồ và bố cục nhiều trang tính.

## Định dạng được hỗ trợ

| Định dạng                | Phần mở rộng |
| :----------------------- | :----------- |
| Excel (hiện đại)         | `.xlsx`      |
| Excel (cũ)               | `.xls`       |
| OpenDocument Spreadsheet | `.ods`       |
| CSV                      | `.csv`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo thả các tệp bảng tính.
2. Xem lại danh sách tệp. Thêm tệp hoặc xóa những tệp không cần.
3. Nhấp **Chuyển đổi sang PDF**. Engine LibreOffice khởi tạo ở lần dùng đầu tiên, sau đó xử lý từng tệp.
4. Một tệp được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được cung cấp dưới dạng `excel-converted.zip`.

## Tùy chọn

Công cụ này không có cấu hình bổ sung. Engine LibreOffice quyết định bố cục trang, tỷ lệ và vùng in dựa trên cài đặt sẵn có của bảng tính.

## Đầu ra

| Số tệp đầu vào | Đầu ra                                                   |
| :------------- | :------------------------------------------------------- |
| 1 tệp          | Tải xuống một PDF (tên tệp gốc với phần mở rộng `.pdf`)  |
| 2+ tệp         | Kho ZIP (`excel-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển báo cáo tài chính hoặc ngân sách từ Excel sang PDF để phân phối
- Tạo PDF sẵn sàng in từ bảng tính hàng tồn kho hoặc danh mục sản phẩm
- Chia sẻ kết quả phân tích dữ liệu với các bên liên quan không cài Excel
- Lưu trữ báo cáo hằng quý ở định dạng không thể chỉnh sửa
- Chuyển tệp ODS từ LibreOffice Calc sang PDF

## Mẹo

- Biểu đồ nhúng trong bảng tính được kết xuất trong PDF. Hãy đảm bảo chúng hiển thị đúng trong tệp nguồn trước khi chuyển đổi.
- Nếu bảng tính có nhiều trang tính, tất cả đều được đưa vào PDF đầu ra.
- Với dữ liệu CSV đơn giản không có định dạng, công cụ [CSV sang PDF](./csv-to-pdf) cho cách chuyển đổi nhẹ hơn. Dùng Excel sang PDF khi bạn cần giữ nguyên định dạng, biểu đồ hoặc nhiều trang tính.

## Công cụ liên quan

- [CSV sang PDF](./csv-to-pdf)
- [Word sang PDF](./word-to-pdf)
- [PowerPoint sang PDF](./powerpoint-to-pdf)
