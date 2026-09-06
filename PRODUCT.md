# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Người học tiếng Nhật ở mọi trình độ, những người muốn học ngoại ngữ một cách tự nhiên qua trải nghiệm gamification trên thiết bị di động. Họ thường học trong thời gian rảnh rỗi, cần sự tương tác và động lực liên tục.

## Product Purpose

Nihongo là một ứng dụng di động học tiếng Nhật tự nhiên. Cung cấp các tính năng học qua bài học (lessons), câu đố (quizzes), luyện giọng/dịch (voice actions), tìm kiếm từ vựng, bảng xếp hạng và theo dõi tiến trình cá nhân để giúp người dùng thành thạo tiếng Nhật không bị nhàm chán.

## Positioning

Ứng dụng kết hợp phương pháp học tập gamification (trò chơi hóa) với các tương tác tự nhiên, đặc biệt khác biệt nhờ sự đồng hành sinh động của các Lottie Mascot và các tính năng luyện nghe/nói/viết trực tiếp trên màn hình cảm ứng.

## Operating Context

Được sử dụng chủ yếu trên điện thoại di động (iOS/Android) hoặc nền tảng Web, trong môi trường cá nhân hoặc khi đang di chuyển. Trải nghiệm học tập được phân chia thành các bài học nhỏ gọn, dễ tiếp thu (micro-learning).

## Capabilities and Constraints

- **Công nghệ**: React Native, Expo SDK 56.0.0, Expo Router.
- **Tính năng cốt lõi**: Xác thực (bao gồm Google Sign-In), Gamification (Mascot, Bảng xếp hạng, Quà tặng, Chuỗi ngày học), Luyện tập đa kỹ năng (Nghe, Nói, Đọc, Viết nét chữ).
- **Ràng buộc UI**: Bố cục cần nhất quán, hỗ trợ Dark/Light mode tự động (đã có `themed-text.tsx`, `themed-view.tsx`), tái sử dụng các components chung trong `src/components/ui/`.
- Không được phá vỡ cấu trúc định tuyến (app routing) đã định nghĩa.

## Brand Commitments

- Thân thiện, vui vẻ, mang tính khích lệ cao (thể hiện rõ qua Lottie Mascot và phần thưởng).
- Sử dụng phong cách thiết kế hiện đại: Glassmorphism, Gradient tinh tế, Shadow phân tầng sâu cho giao diện (theo chuẩn Premium).

## Evidence on Hand

Dự án có sẵn dữ liệu mẫu (`src/data/`) cho các bài học, từ vựng, câu đố, từ điển và tiến độ ôn tập để thử nghiệm. Có sẵn các file cấu hình chuyển động mượt mà (Lottie Mascot JSON, react-native-reanimated).

## Product Principles

1. **Khuyến khích tương tác**: Việc học phải giống như một trò chơi thú vị, luôn có phản hồi và động viên tức thì.
2. **Mượt mà và Hiện đại**: Trải nghiệm UI/UX phải tinh tế, mượt mà (hiệu ứng chuyển cảnh iOS-like, micro-animations, animated pressables).
3. **Hiệu quả thực tế**: Hỗ trợ đầy đủ các kỹ năng với các công cụ tương tác cao như Writing Canvas và Voice Translation.
