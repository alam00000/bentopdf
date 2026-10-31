---
title: Xác minh chữ ký PDF
description: Xác minh chữ ký số trong tệp PDF. Kiểm tra tính hợp lệ của chứng chỉ, danh tính người ký, tính toàn vẹn của tài liệu và trạng thái chuỗi tin cậy.
---

# Xác minh chữ ký PDF

Tải lên một PDF đã ký và công cụ này sẽ trích xuất mọi chữ ký số, xác định người ký, kiểm tra tính hợp lệ của chứng chỉ và báo cáo liệu tài liệu có bị sửa đổi kể từ khi ký hay không. Bạn cũng có thể cung cấp một chứng chỉ tin cậy để xác minh chuỗi chữ ký.

## Cách hoạt động

1. Tải lên một tệp PDF đã ký. Việc xác minh bắt đầu tự động.
2. Công cụ hiển thị bản tóm tắt: số chữ ký tìm thấy, bao nhiêu chữ ký hợp lệ.
3. Mỗi chữ ký có một thẻ chi tiết hiển thị tên người ký, bên cấp, ngày tháng và trạng thái.
4. Tùy chọn, tải lên một **chứng chỉ tin cậy** (.pem, .crt, .cer, .der) để xác minh chữ ký theo một trust anchor cụ thể. Việc xác minh lại chạy tự động.

## Những gì được kiểm tra

### Phân tích chữ ký

Công cụ trích xuất các đối tượng chữ ký PKCS#7 từ PDF, giải mã cấu trúc ASN.1 và lấy chứng chỉ X.509 của người ký cùng với bất kỳ chuỗi chứng chỉ nào được nhúng trong chữ ký.

### Tính hợp lệ của chứng chỉ

- **Hết hạn**: Chứng chỉ hiện có nằm trong thời hạn hiệu lực không?
- **Phát hiện tự ký**: Chứng chỉ có phải do chính nó cấp không?
- **Chuỗi tin cậy**: Khi có chứng chỉ tin cậy, chứng chỉ của người ký có liên kết ngược về chứng chỉ đó không?

### Xác minh mật mã

- Công cụ dựng lại các byte nằm trong `/ByteRange` của chữ ký, băm chúng bằng thuật toán mà người ký đã khai báo, rồi so sánh kết quả với thuộc tính `messageDigest` bên trong chữ ký.
- Sau đó, công cụ tuần tự hóa lại các thuộc tính đã ký dưới dạng DER SET và xác minh chữ ký bằng khóa công khai của chứng chỉ người ký.
- **Chữ ký chỉ được báo cáo là hợp lệ khi tất cả các bước này đều đạt.** Nếu các byte của PDF bị sửa đổi sau khi ký, hoặc chữ ký nhúng không khớp với khóa của người ký, trạng thái sẽ hiển thị "Không hợp lệ: Xác minh mật mã không thành công" kèm lý do cụ thể.

#### Thuật toán chữ ký được hỗ trợ

| Thuật toán              | Đường dẫn xác minh                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, với Web Crypto dự phòng                                |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                    |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` sau khi chuyển đổi chữ ký DER → IEEE P1363 |

Nếu chữ ký dùng thuật toán nằm ngoài danh sách này (ví dụ Ed25519, SM2 hoặc RSA với OID digest bất thường), thẻ sẽ hiển thị **"Chưa xác minh: Thuật toán chữ ký không được hỗ trợ"** màu vàng, kèm OID hoặc lý do cụ thể. Đây là sự phân biệt ba trạng thái có chủ đích:

- **Hợp lệ**: chữ ký đã được xác minh bằng mật mã với khóa công khai của người ký.
- **Không hợp lệ**: việc xác minh đã chạy và cho kết quả âm tính (byte bị thay đổi, khóa không khớp).
- **Chưa xác minh**: công cụ không thể chạy xác minh cho thuật toán này. Siêu dữ liệu chứng chỉ vẫn được hiển thị, nhưng bạn nên coi chữ ký là "không rõ" và xác minh bằng Adobe Acrobat hoặc `openssl cms -verify`.

### Thuật toán digest không an toàn

- Chữ ký dùng **MD5 hoặc SHA-1** bị từ chối là không hợp lệ và được gắn trạng thái "Thuật toán băm không an toàn". Cả hai thuật toán đều đã có các cuộc tấn công va chạm được công bố, nên chữ ký trên hash SHA-1 hoặc MD5 không đảm bảo tính toàn vẹn.
- SHA-224, SHA-256, SHA-384 và SHA-512 đều được chấp nhận.

### Phạm vi bao phủ tài liệu

- **Bao phủ toàn bộ**: Chữ ký bao phủ toàn bộ tệp PDF, nghĩa là không có byte nào được thêm hoặc thay đổi sau khi ký.
- **Bao phủ một phần**: Chữ ký chỉ bao phủ một phần của tệp. Điều này có thể cho thấy đã có sửa đổi sau khi ký (không nhất thiết là độc hại: lưu tăng dần cũng tạo ra phạm vi bao phủ một phần).

## Chi tiết chữ ký

Mỗi thẻ chữ ký hiển thị:

- **Người ký**: Tên chung, tổ chức và email từ chứng chỉ của người ký
- **Bên cấp**: Tổ chức cấp chứng chỉ (Certificate Authority) đã cấp chứng chỉ của người ký
- **Ngày ký**: Dấu thời gian được nhúng trong chữ ký
- **Có hiệu lực từ / Có hiệu lực đến**: Thời hạn hiệu lực của chứng chỉ
- **Lý do**: Lý do ký tài liệu (nếu có)
- **Địa điểm**: Nơi ký (nếu có)
- **Trạng thái bao phủ**: Toàn bộ hoặc Một phần
- **Huy hiệu tin cậy**: Đáng tin cậy hoặc Không thuộc chuỗi tin cậy (chỉ khi cung cấp chứng chỉ tùy chỉnh)

### Chi tiết kỹ thuật

Mở rộng phần chi tiết kỹ thuật để xem:

- Số sê-ri của chứng chỉ người ký
- Thuật toán digest (SHA-256, SHA-512, v.v.)
- Thuật toán chữ ký (RSA với SHA-256, ECDSA với SHA-256, v.v.)
- Thông báo lỗi cho các chữ ký không hợp lệ

## Trường hợp sử dụng

- Xác minh hợp đồng đã ký số trước khi đồng ký
- Kiểm tra các tài liệu đã ký để xác nhận chúng không bị giả mạo
- Kiểm tra xem chứng chỉ đã hết hạn kể từ khi tài liệu được ký hay chưa
- Xác thực chữ ký theo chứng chỉ gốc của tổ chức bạn
- Xem chi tiết việc ký của các tài liệu chính phủ hoặc pháp lý

## Mẹo

- Chứng chỉ tự ký không có nghĩa là chữ ký không hợp lệ: nó có nghĩa là danh tính người ký không thể được xác minh qua bên thứ ba đáng tin cậy. Điều này phổ biến với tài liệu nội bộ.
- Bao phủ một phần không phải lúc nào cũng cho thấy có giả mạo. Nhiều quy trình PDF thêm các cập nhật tăng dần (như chữ ký thứ hai) tạo ra phạm vi bao phủ một phần.
- Hãy tải lên chứng chỉ gốc hoặc chứng chỉ trung gian của tổ chức bạn làm chứng chỉ tin cậy để được xác minh chuỗi tin cậy.

## Công cụ liên quan

- [Chữ ký số PDF](./digital-sign-pdf): ký PDF bằng chứng chỉ của riêng bạn
- [Làm phẳng PDF](./flatten-pdf): làm phẳng PDF trước khi ký để ngăn sửa đổi sau khi ký
- [Xóa Metadata](./remove-metadata): làm sạch PDF trước khi áp dụng chữ ký
