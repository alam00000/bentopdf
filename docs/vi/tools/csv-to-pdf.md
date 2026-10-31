---
title: CSV sang PDF
description: Chuyển đổi tệp bảng tính CSV thành bảng PDF đã định dạng ngay trong trình duyệt.
---

# CSV sang PDF

Biến tệp CSV thành tài liệu PDF gọn gàng, đã định dạng. Mỗi tệp CSV được phân tích và hiển thị dưới dạng bảng trong PDF đầu ra. Điều này hữu ích khi bạn cần in hoặc chia sẻ dữ liệu dạng bảng mà người nhận không cần có phần mềm bảng tính.

## Định dạng được hỗ trợ

| Định dạng | Phần mở rộng |
| :-------- | :----------- |
| CSV       | `.csv`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo thả một hoặc nhiều tệp CSV.
2. Xem lại danh sách tệp. Thêm tệp hoặc xóa những tệp không cần.
3. Nhấp **Chuyển đổi sang PDF**. Thanh tiến trình hiển thị trạng thái chuyển đổi.
4. Một tệp được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được đóng gói vào `csv-converted.zip`.

## Tùy chọn

Công cụ này không có cấu hình bổ sung. CSV được tự động phân tích và định dạng thành bảng.

## Đầu ra

| Số tệp đầu vào | Đầu ra                                                 |
| :------------- | :----------------------------------------------------- |
| 1 tệp          | Tải xuống một PDF (ví dụ: `data.pdf`)                  |
| 2+ tệp         | Kho ZIP (`csv-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển các báo cáo cơ sở dữ liệu đã xuất thành bảng PDF có thể in
- Chia sẻ dữ liệu tài chính hoặc danh sách kho cho người không có Excel
- Tạo phiên bản PDF của tệp nhật ký CSV cho tài liệu tuân thủ
- In danh sách địa chỉ, bảng điểm hoặc bất kỳ dữ liệu bảng nào lưu dưới dạng CSV

## Mẹo

- Để có kết quả tốt nhất, hãy đảm bảo CSV dùng dấu phân cách là dấu phẩy chuẩn. Công cụ tuân theo các quy ước phân tích CSV phổ biến.
- Nếu CSV có nhiều cột, bảng có thể bị nén lại để vừa chiều rộng trang. Hãy cân nhắc chia các bộ dữ liệu rộng thành nhiều tệp.
- Với tệp Excel (`.xls`, `.xlsx`), hãy dùng công cụ [Excel sang PDF](./excel-to-pdf), giữ nguyên định dạng bảng tính và nhiều trang tính.

## Công cụ liên quan

- [Excel sang PDF](./excel-to-pdf)
- [Văn bản sang PDF](./txt-to-pdf)
- [JSON sang PDF](./json-to-pdf)
