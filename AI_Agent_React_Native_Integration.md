# Tài liệu Hướng dẫn Tích hợp Frontend (React Native) & Backend (Spring Boot)

**Mục đích:** Tài liệu này cung cấp cho AI Agent danh sách các tác vụ, luồng logic và API chi tiết để thực hiện việc kết nối Frontend React Native với Backend cho module Xác thực, Hồ sơ người dùng và Tính năng Bạn bè (Tìm kiếm, Danh bạ, Quét QR, Theo dõi).

---

## 1. Module Đăng ký & Đăng nhập (Authentication)

### 1.1. API Đăng ký tài khoản

- **Endpoint:** `POST /api/v1/auth/register`
- **Body Request:**
  ```json
  {
    "email": "kiet@gmail.com",
    "password": "123",
    "displayName": "Tuấn Kiệt" // (Optional) Có thể người dùng không nhập
  }
  ```
- **Phân tích Logic Frontend cần xử lý:**
  - Giao diện có 3 trường: Email, Mật khẩu, Tên hiển thị (Tùy chọn).
  - Backend đã tự động xử lý việc sinh `username` từ `email` nếu người dùng không nhập tên.
  - **Auto-login:** API đăng ký trả về response giống hệt API đăng nhập. Ngay khi đăng ký thành công, Frontend cần lưu `accessToken` và thông tin `user` vào state/local storage và tự động đăng nhập người dùng vào màn hình chính.
- **Mẫu Response mong đợi:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 12,
      "email": "tung@gmail.com",
      "displayName": "tung",
      "username": "tung_8391",
      "role": "LEARNER"
    }
  }
  ```

### 1.2. Logic Hoàn thiện hồ sơ (Nhắc nhở cập nhật Username)

- **Kiểm tra trạng thái:** Dựa vào dữ liệu user trả về, Frontend kiểm tra cờ `is_profile_completed == false` (hoặc kiểm tra tính hợp lệ của username tự sinh).
- **Hành động:** Nếu chưa hoàn thiện, hiển thị UI nhắc nhở cập nhật Username ở phần Hồ sơ.
- **Phân biệt hiển thị:**
  - `displayName`: Hiển thị to, nổi bật nhất (Tên người dùng).
  - `username`: Hiển thị nhỏ hơn ngay bên dưới, kèm theo ký tự `@` (Ví dụ: `@tung_8391`). Được dùng để định danh, chia sẻ và tạo mã QR.

---

## 2. Module Quản lý Hồ sơ Người dùng (Profile)

### 2.1. API Cập nhật hồ sơ (Đổi Username)

- **Endpoint:** `PUT /api/v1/users/me/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body Request:**
  ```json
  {
    "displayName": "Tùng Hồ",
    "username": "tungho_official"
  }
  ```
- **Kết quả mong đợi:** Trả về thông tin User đã cập nhật kèm Token mới (Frontend cần cập nhật lại phiên đăng nhập).

### 2.2. API Cập nhật Số điện thoại bổ sung

- **Endpoint:** `PUT /api/v1/users/me/phone`
- **Headers:** `Authorization: Bearer <token>`
- **Body Request:**
  ```json
  {
    "phoneNumber": "0987654321"
  }
  ```
- **Ngữ cảnh:** Giao diện cho phép người dùng nhập SĐT bổ sung (tương tự Duolingo) để người khác có thể tìm thấy họ qua danh bạ.

---

## 3. Module Tìm kiếm Bạn bè (Friends & Search)

### 3.1. Tìm bạn qua Danh bạ điện thoại (Contacts Sync)

- **Luồng xin quyền (Sử dụng `expo-contacts` hoặc thư viện tương đương):**
  1. Chạy ngầm kiểm tra xem đã cấp quyền danh bạ chưa.
  2. Nếu chưa, gọi popup của OS (iOS/Android) yêu cầu quyền (Nội dung mặc định của OS).
  3. **Xử lý rẽ nhánh:**
     - Nếu **Từ chối (Denied)**: Hiển thị thông báo thân thiện "Rất tiếc, ứng dụng cần quyền truy cập danh bạ để tìm bạn bè giúp bạn. Bạn có thể cấp quyền lại trong phần Cài đặt của máy."
     - Nếu **Cho phép (Allow)**: Đọc danh bạ, gom các số điện thoại thành một mảng và gọi API đồng bộ.
- **API Đồng bộ Danh bạ:**
  - **Endpoint:** `POST /api/v1/users/sync-contacts`
  - **Headers:** `Authorization: Bearer <token>`
  - **Body Request:**
    ```json
    {
      "phoneNumbers": ["0911111111", "0987654321", "0922222222"]
    }
    ```

### 3.2. Tìm kiếm chung (Omnibox Search 3-trong-1)

- **Thiết kế UI:** Chỉ sử dụng 1 ô tìm kiếm duy nhất cho tất cả các loại dữ liệu (Tên, Username, Email).
- **API Tìm kiếm:**
  - **Endpoint:** `GET /api/v1/users/search?keyword={keyword}`
  - **Headers:** `Authorization: Bearer <token>`
- **Xử lý Frontend:**
  - Render mảng danh sách người dùng trả về (Tên, Avatar, Level).
  - **Quan trọng:** Dựa vào cờ `isFollowing` (boolean) trong từng object user trả về để hiển thị UI nút bấm:
    - `isFollowing == false`: Nút "THEO DÕI" màu xanh.
    - `isFollowing == true`: Nút "ĐANG THEO DÕI" màu xám.

---

## 4. Module Tương tác (Follow & Mã QR)

### 4.1. Chức năng Theo dõi (Follow / Unfollow)

- **Endpoint:** `POST /api/v1/users/{id}/follow` (Tham số `id` truyền trên URL)
- **Headers:** `Authorization: Bearer <token>`
- **Logic:**
  - API hoạt động theo cơ chế Toggle (Bấm lần 1 để follow, bấm lần 2 để unfollow).
  - Frontend cần gọi API này khi người dùng bấm nút Theo dõi ở danh sách tìm kiếm hoặc trong trang Hồ sơ chi tiết.

### 4.2. Chức năng Mã QR Kết bạn (QR Code)

- **Nguyên tắc tạo QR:**
  - **Mã QR LUÔN LUÔN được sinh từ cột `username`**, tuyệt đối không dùng `displayName` vì có thể chứa dấu cách và tiếng Việt.
  - Sử dụng username hiện tại của user (Dù là tự sinh lúc đăng ký hay đã cập nhật).
- **Nhiệm vụ của Frontend:**
  - Backend KHÔNG trả về file ảnh QR.
  - Frontend sử dụng thư viện (như `react-native-qrcode-svg`) để tự vẽ mã QR từ chuỗi Deep Link.
  - Chuỗi mã hóa vào QR có dạng: `nihongoapp://profile/@username` hoặc `https://nihongoapp.com/user/@username`.
- **Luồng quét QR (Deep Linking):**
  1. Camera điện thoại quét mã QR -> Hệ điều hành tự động mở app thông qua Deep Link.
  2. App bóc tách lấy `username` từ link.
  3. Gọi API lấy thông tin Profile chi tiết.

### 4.3. API Xem Profile chi tiết qua Username (Từ quét QR)

- **Endpoint:** `GET /api/v1/users/profile/{username}`
- **Headers:** `Authorization: Bearer <token>`
- **Xử lý Frontend:**
  - Hiển thị chi tiết hồ sơ.
  - Kiểm tra biến `isFollowing` trả về từ API này để hiển thị đúng trạng thái nút "Theo dõi" (true/false) giống như phần tìm kiếm.
