---
title: PowerPoint sang PDF
description: Chuyển đổi bản trình bày PowerPoint (PPT, PPTX) và tệp ODP sang PDF với định dạng slide được giữ nguyên.
---

# PowerPoint sang PDF

Chuyển đổi tệp bản trình bày sang PDF. Mỗi slide trở thành một trang trong tài liệu đầu ra, với văn bản, hình ảnh, hình khối và hiệu ứng chuyển cảnh được hiển thị bằng engine LibreOffice chạy trong trình duyệt. Hỗ trợ cả định dạng PowerPoint hiện đại lẫn cũ, cùng định dạng OpenDocument Presentation.

## Định dạng được hỗ trợ

| Định dạng                 | Phần mở rộng |
| :------------------------ | :----------- |
| PowerPoint (hiện đại)     | `.pptx`      |
| PowerPoint (cũ)           | `.ppt`       |
| OpenDocument Presentation | `.odp`       |

## Cách hoạt động

1. Nhấp vào vùng tải lên hoặc kéo và thả các tệp bản trình bày của bạn.
2. Xem lại danh sách tệp. Thêm hoặc xóa tệp nếu cần.
3. Nhấp **Chuyển đổi sang PDF**. Engine LibreOffice được tải ở lần dùng đầu tiên, sau đó chuyển đổi từng tệp.
4. Một tệp duy nhất được tải xuống trực tiếp dưới dạng PDF. Nhiều tệp được đóng gói vào `powerpoint-converted.zip`.

## Tùy chọn

Công cụ này không có cài đặt bổ sung. Các slide được hiển thị ở kích thước gốc.

## Đầu ra

| Số tệp đầu vào | Đầu ra                                                        |
| :------------- | :------------------------------------------------------------ |
| 1 tệp          | Tải xuống một PDF (tên tệp gốc với phần mở rộng `.pdf`)       |
| 2 tệp trở lên  | Tệp ZIP (`powerpoint-converted.zip`) chứa một PDF cho mỗi tệp |

## Trường hợp sử dụng

- Chuyển bản trình bày sang PDF trước khi chia sẻ với khán giả có thể không có PowerPoint
- Tạo bản tài liệu in được từ bộ slide cho hội nghị hoặc hội thảo
- Lưu trữ bản trình bày ở định dạng hiển thị giống hệt trên mọi thiết bị
- Chuyển đổi hàng loạt thư viện bản trình bày ODP từ LibreOffice Impress sang PDF
- Tạo phiên bản PDF của bộ slide giới thiệu để đính kèm email

## Mẹo

- Hiệu ứng động và chuyển cảnh của slide không được thể hiện trong PDF. Mỗi slide được ghi lại thành một trang tĩnh.
- Video nhúng sẽ không xuất hiện trong đầu ra. Hãy thay bằng ảnh chụp màn hình hoặc hình giữ chỗ nếu cần.
- Ghi chú của người trình bày không có trong bản xuất PDF mặc định. Nếu cần ghi chú, hãy cân nhắc xuất từ chế độ xem "Print Notes" gốc của PowerPoint trước.
- Engine LibreOffice được lưu đệm sau lần tải đầu, nên chuyển đổi bản trình bày thứ hai trong cùng phiên sẽ nhanh hơn nhiều.

## Công cụ liên quan

- [Word sang PDF](./word-to-pdf)
- [Excel sang PDF](./excel-to-pdf)
- [Hình ảnh sang PDF](./image-to-pdf)
