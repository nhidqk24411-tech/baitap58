# BÀI TẬP 58 - HỆ THỐNG THỜI TRANG FASHION EDITORIAL & ADMIN WYSIWYG

Dự án ứng dụng web thời trang hiện đại được xây dựng trên nền tảng **Angular 22**, **Node.js (Express)** và cơ sở dữ liệu **MongoDB**.

---

## 🌟 TÍNH NĂNG CHÍNH

### 1. Client Tạp Chí Thời Trang (Vogue Editorial Magazine)
- **Đường dẫn**: `/bai58-fashion-client`
- **Thanh danh mục tương tác**: Các chuyên mục `ALL STORIES`, `STREET STYLE`, `TRENDS`, `CELEBRITY STYLE`, `FASHION WEEK`, `RUNWAY` với hiệu ứng chuyển vạch gạch chân đen và lọc bài viết tức thì.
- **Tìm kiếm & Bộ lọc linh hoạt**: Hỗ trợ tìm kiếm theo phong cách ("TRY 'STREET STYLE'") và lọc theo dropdownlist / quick chips.
- **Bố cục lưới 4 ảnh (Vogue Grid)**: Hiển thị 4 thẻ card trên một hàng có camera icon overlay và hiệu ứng zoom ảnh.
- **Trang chi tiết bài viết**: Thanh "QUAY LẠI TRANG BỘ SƯU TẬP" cố định tự nhiên ở đầu trang, nội dung bài viết định dạng HTML phong phú qua SafeHtmlPipe và gợi ý bài viết cùng phong cách.

### 2. Admin Quản Trị Hệ Thống (WYSIWYG Editor & CRUD)
- **Đường dẫn**: `/bai58-fashion-admin`
- **Quản lý danh sách**: Bảng hiển thị Cột IdF, ảnh thumbnail, tiêu đề, phong cách, slug chuẩn SEO và tóm tắt nội dung.
- **Bộ soạn thảo trực quan WYSIWYG Editor**:
  - Hỗ trợ đầy đủ định dạng văn bản: In đậm, in nghiêng, gạch chân, tiêu đề H1-H4, màu chữ, màu nền highlight, cỡ chữ, phông chữ luxury.
  - Chèn liên kết hyperlink, tải ảnh trực tiếp (tự động chuyển Base64), chèn bảng dữ liệu tùy chọn số hàng/cột.
  - Chế độ xem trước thời gian thực (Live Preview) và chỉnh sửa trực tiếp mã nguồn HTML (Source Code).
- **Hộp thoại Modal**: Modal xem trước chi tiết bài viết và Modal xác nhận xóa bài viết.

### 3. Cột IdF & Hệ Thống Tự Động Phân Tích Slug SEO
- **Đường dẫn**: `/fashion-slug-list` & `/fashion-slug-detail/:slug`
- **Cột IdF duy nhất**: Mỗi sản phẩm thời trang được cấp phát một mã số nguyên dương duy nhất (`#1`, `#2`, `#3`...), tự động tăng dần khi tạo mới để không bao giờ bị trùng lặp.
- **Quy tắc sinh Slug**:
  $$\text{Slug} = \text{toSlug}(\text{tiêu đề}) + \text{"-" + IdF}$$
  *(Ví dụ: Tiêu đề `"Cafe Prince subject"`, `IdF = 11` $\rightarrow$ `cafe-prince-subject-11`)*.
- **Tự động phân tích Slug**: Hệ thống giải mã bóc tách `IdF` và `baseSlug` từ đường dẫn URL để truy vấn và hiển thị chính xác Fashion Detail mong muốn.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### 1. Khởi động Backend Server
```bash
cd server
npm install
npm start
```
*Server API RESTful sẽ chạy tại: `http://localhost:4000/fashions`*

### 2. Khởi động Frontend Angular Client
```bash
npm install
npm start
```
*Giao diện người dùng sẽ chạy tại: `http://localhost:4200/`*

### 3. Các đường dẫn truy cập nhanh
- **Trang chủ học tập (Menu tổng hợp)**: `http://localhost:4200/`
- **Client Tạp chí Vogue**: `http://localhost:4200/bai58-fashion-client`
- **Admin Quản trị WYSIWYG**: `http://localhost:4200/bai58-fashion-admin`
- **Fashion Slug & Cột IdF**: `http://localhost:4200/fashion-slug-list`

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG
- **Frontend**: Angular 22, TypeScript, RxJS, Bootstrap 5, Bootstrap Icons, Google Fonts (Playfair Display & Plus Jakarta Sans).
- **Backend**: Node.js, Express.js, MongoDB Driver, Morgan, CORS, Body-Parser.
- **Database**: MongoDB (`FashionData`, Collection: `Fashion`).
