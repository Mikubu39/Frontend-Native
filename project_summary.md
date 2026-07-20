# Tổng quan Dự án Kotodama

Kotodama là một ứng dụng di động học tiếng Nhật tự nhiên, được xây dựng trên nền tảng **React Native** sử dụng **Expo** (phiên bản SDK 56.0.0) và định tuyến bằng **Expo Router**. Ứng dụng cung cấp các tính năng học qua bài học (lessons), câu đố (quizzes), luyện giọng/dịch (voice actions), tìm kiếm từ vựng, bảng xếp hạng (leaderboard), và lưu trữ tiến trình cá nhân.

---

## 1. Cấu trúc Thư mục Dự án

Dưới đây là sơ đồ chi tiết cấu trúc thư mục của dự án (`src/`):

```
src/
├── app/                  # Các màn hình định tuyến của Expo Router (chỉ chứa giao diện và logic chuyển trang)
│   ├── (auth)/           # Luồng xác thực người dùng (Đăng nhập, Đăng ký)
│   ├── (onboarding)/     # Luồng khảo sát người dùng mới (Mục tiêu, Sở thích, Trình độ)
│   ├── (tabs)/           # Giao diện Bottom Tabs chính (Bài học, Ký tự, Từ điển, Tìm kiếm, Ôn tập, Hồ sơ, Bảng tin, Xếp hạng, Xem thêm)
│   ├── friends/          # Màn hình quản lý bạn bè
│   ├── lesson/           # Chi tiết bài học và tập viết ký tự (hiragana/katakana/kanji)
│   ├── profile/          # Chi tiết thông tin cá nhân nâng cao
│   ├── quiz/             # Giao diện chuẩn bị, làm bài test và xem kết quả câu đố
│   ├── voice/            # Thực hành nghe, ghi âm và dịch thuật giọng nói
│   ├── _layout.tsx       # Cấu hình Stack Navigator gốc
│   ├── index.tsx         # Điểm khởi đầu kiểm tra trạng thái Auth
│   ├── welcome.tsx       # Màn hình chào mừng người dùng mới
│   └── reward.tsx        # Giao diện nhận phần thưởng học tập
├── components/           # Các component tái sử dụng (chia theo các tính năng/domain)
│   ├── auth/             # Biểu mẫu xác thực, tiêu đề, nút đăng nhập mạng xã hội
│   ├── dictionary/       # Thẻ hiển thị thông tin chi tiết từ vựng
│   ├── lessons/          # Sơ đồ bài học (Map), bong bóng bài học, canvas viết chữ, hiển thị ký tự
│   ├── onboarding/       # Bộ chọn mục tiêu, sở thích, trình độ học tập
│   ├── profile/          # Giao diện hồ sơ, thẻ thành tích, phần thưởng
│   ├── quiz/             # Giao diện câu hỏi trắc nghiệm, hình ảnh, điền kanji, kết quả quiz
│   ├── review/           # Thẻ hiển thị tiến trình ôn tập và danh sách theo tuần
│   ├── search/           # Giao diện tìm kiếm, danh mục từ vựng phổ biến
│   ├── ui/               # Các UI Primitives cơ bản (nút nhấn, ô nhập liệu, thanh tiến trình, modal, v.v.)
│   ├── voice/            # Luyện nói, nút ghi âm, vòng tròn hiển thị điểm số, bộ dịch
│   ├── themed-text.tsx   # Văn bản hỗ trợ Dark/Light Mode tự động
│   └── themed-view.tsx   # Container hỗ trợ Dark/Light Mode tự động
├── config/               # Cấu hình môi trường (Client ID cho Google Auth...)
├── constants/            # Định nghĩa theme, màu sắc, font chữ và kích thước (Theme.ts)
├── contexts/             # Quản lý trạng thái toàn cục (Xác thực, Onboarding, Trạng thái Quiz)
├── data/                 # Dữ liệu tĩnh hoặc dữ liệu mẫu (Mock data) phục vụ chạy offline/demo
├── hooks/                # Các React Hook tùy biến (Âm thanh, chủ đề giao diện...)
├── locales/              # Hỗ trợ đa ngôn ngữ i18n (Tiếng Anh, Tiếng Việt)
├── services/             # API Client và lưu trữ cục bộ (AsyncStorage)
├── types/                # Định nghĩa các TypeScript Interface, Types và Enum cho toàn hệ thống
└── utils/                # Các hàm tiện ích thuần túy (helpers) và logic xác thực dữ liệu đầu vào
```

---

## 2. Mô tả Chi tiết các Thư mục chính

### 📂 `src/app/` (Expo Router Screens)
Tất cả các file ở đây đại diện cho một màn hình. Theo quy tắc của dự án, logic nghiệp vụ phức tạp hoặc giao diện thành phần chi tiết **không** viết trực tiếp ở đây mà được tách ra các component trong `src/components/`.
- [_layout.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/_layout.tsx): Stack navigator chính quản lý chuyển cảnh giữa Splash -> Auth -> Onboarding -> Tabs và các modal phụ.
- [index.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/index.tsx): Điểm khởi đầu kiểm tra trạng thái đăng nhập để tự động điều hướng tới `/(tabs)` hoặc `/welcome`.
- [welcome.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/welcome.tsx): Màn hình chào mừng và dẫn vào luồng Đăng nhập/Đăng ký.
- [reward.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/reward.tsx): Màn hình nhận thưởng hấp dẫn cho người dùng khi hoàn thành mốc học tập.
- `(auth)`: Luồng xác thực gồm [login.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(auth)/login.tsx), [signup.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(auth)/signup.tsx) và file cấu hình layout.
- `(onboarding)`: Thu thập thông tin khảo sát ban đầu về mục tiêu học [goal.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(onboarding)/goal.tsx), sở thích [interests.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(onboarding)/interests.tsx), trình độ hiện tại [level.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(onboarding)/level.tsx) và bài kiểm tra đầu vào [placement.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(onboarding)/placement.tsx).
- `(tabs)`: Bộ định tuyến bottom tab gồm:
  - `index.tsx`: Hiển thị sơ đồ bài học dạng cây kỹ năng.
  - `characters.tsx`: Học và luyện tập bảng chữ cái tiếng Nhật (Hiragana, Katakana) tích hợp canvas vẽ nét chữ.
  - `dictionary.tsx`: Bộ từ điển tra cứu từ vựng chi tiết.
  - `search.tsx`: Thanh tìm kiếm từ vựng và xem các danh mục từ phổ biến.
  - `review.tsx`: Quản lý việc ôn tập các từ vựng đã học theo tuần/kỹ năng.
  - `profile.tsx`: Xem thông tin thành tích cá nhân, số streak và các huy chương.
  - `feed.tsx`: Bảng tin hoạt động xã hội, cập nhật tiến độ của bạn bè.
  - `leaderboard.tsx`: Bảng xếp hạng điểm số thi đua giữa những người học.
  - `more.tsx`: Menu mở rộng cho các thiết lập ứng dụng khác (Cài đặt, thông tin...).
- `friends/`: Giao diện quản lý danh sách bạn bè, lời mời kết bạn.
- `lesson/`:
  - `[id].tsx`: Giao diện học chi tiết một bài học từ vựng/ngữ pháp.
  - `character/[id].tsx`: Màn hình chi tiết học và tập viết từng ký tự.
- `quiz/`:
  - `ready.tsx`: Màn hình đếm ngược chuẩn bị trước khi vào bài kiểm tra.
  - `[id].tsx`: Giao diện tương tác làm bài câu đố.
  - `result.tsx`: Màn hình hiển thị điểm số, phần trăm chính xác sau bài test.
- `voice/`:
  - `listen.tsx`: Luyện nghe các đoạn hội thoại mẫu.
  - `record.tsx`: Ghi âm giọng nói của người dùng và nhận diện chấm điểm.
  - `translate.tsx`: Dịch thuật nhanh qua giọng nói Việt-Nhật.

---

### 📂 `src/components/` (Các Component giao diện)
Nơi chứa toàn bộ thành phần giao diện, được module hóa theo từng tính năng để tránh lặp mã:
- **`ui/`**: Chứa các component cơ sở dùng chung với hiệu ứng cao cấp:
  - [animated-screen.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-screen.tsx): Cung cấp hiệu ứng chuyển động mượt mà cho toàn màn hình.
  - [animated-tab-icon.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-tab-icon.tsx): Tạo chuyển động vi mô (micro-animation) cho biểu tượng tab dưới cùng.
  - [animated-pressable.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-pressable.tsx): Component nút bấm hỗ trợ hiệu ứng co giãn (scale-down) và phản hồi vật lý khi nhấn.
  - [staggered-list.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/staggered-list.tsx): Wrapper hỗ trợ hiển thị danh sách các thành phần với hiệu ứng xuất hiện so le (staggered delay).
  - [gradient-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/gradient-button.tsx), [progress-bar.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/progress-bar.tsx), [text-input.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/text-input.tsx), [audio-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/audio-button.tsx), [circle-progress.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/circle-progress.tsx), [collapsible.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/collapsible.tsx), [flag-icon.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/flag-icon.tsx), [modal-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/modal-card.tsx), [option-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/option-card.tsx), [password-validator.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/password-validator.tsx), [social-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/social-button.tsx), [tab-switcher.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/tab-switcher.tsx).
- **`auth/`**: Component phục vụ xác thực gồm biểu mẫu đăng nhập [auth-form.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/auth/auth-form.tsx), tiêu đề [auth-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/auth/auth-header.tsx), [google-sign-in-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/auth/google-sign-in-button.tsx) và [social-auth-section.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/auth/social-auth-section.tsx).
- **`dictionary/`**: Giao diện chi tiết của thẻ từ vựng [word-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/dictionary/word-card.tsx).
- **`lessons/`**: Giao diện hiển thị bài học, bao gồm [lesson-node.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/lesson-node.tsx) đại diện cho các bong bóng bài học, [path-connector.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/path-connector.tsx) vẽ đường nối, [writing-canvas.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/writing-canvas.tsx) hỗ trợ tập viết chữ Nhật trực tiếp, cùng các component tiêu đề [lessons-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/lessons-header.tsx), [character-display.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/character-display.tsx), [lesson-grid.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/lesson-grid.tsx), [progress-tabs.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/progress-tabs.tsx), [section-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/section-card.tsx), [section-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/section-header.tsx).
- **`onboarding/`**: Giao diện bộ chọn câu hỏi khảo sát ban đầu [goal-selector.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/onboarding/goal-selector.tsx), [interest-grid.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/onboarding/interest-grid.tsx), [level-selector.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/onboarding/level-selector.tsx).
- **`profile/`**: Thẻ thông tin cá nhân [profile-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/profile/profile-header.tsx), thẻ điền đầy đủ hồ sơ [complete-profile-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/profile/complete-profile-card.tsx), và danh sách các phần thưởng đã đạt được [reward-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/profile/reward-card.tsx).
- **`quiz/`**: Giao diện tương tác câu đố [kana-question.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/kana-question.tsx), [kanji-fill-question.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/kanji-fill-question.tsx), [picture-question.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/picture-question.tsx), [vocab-question.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/vocab-question.tsx), cùng với [quiz-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/quiz-header.tsx), [swipe-hint.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/swipe-hint.tsx) và màn hình kết quả [quiz-result-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/quiz/quiz-result-card.tsx).
- **`review/`**: Quản lý tiến độ ôn tập kỹ năng [skill-progress-card.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/review/skill-progress-card.tsx) và danh sách theo tuần [week-list.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/review/week-list.tsx).
- **`search/`**: Thanh tìm kiếm từ vựng [search-header.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/search/search-header.tsx) và ô lưới phân loại từ vựng [category-grid.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/search/category-grid.tsx).
- **`voice/`**: Luyện nói với nút bấm ghi âm [record-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/voice/record-button.tsx), thang đo điểm số [score-ring.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/voice/score-ring.tsx), nút nghe [listen-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/voice/listen-button.tsx), công tắc ngôn ngữ [language-toggle.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/voice/language-toggle.tsx) và kết quả dịch thuật [translation-result.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/voice/translation-result.tsx).
- **Root components**: [themed-text.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/themed-text.tsx) và [themed-view.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/themed-view.tsx) giúp tự động đổi màu chữ/nền theo giao diện Sáng/Tối. Các tệp phụ trợ như [animated-icon.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/animated-icon.tsx), [app-tabs.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/app-tabs.tsx), [external-link.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/external-link.tsx), [hint-row.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/hint-row.tsx) và [web-badge.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/web-badge.tsx).

---

### 📂 `src/contexts/` (Quản lý trạng thái)
Đóng vai trò quản trị State chung cho toàn bộ ứng dụng:
- [auth-context.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/contexts/auth-context.tsx): Cung cấp hàm đăng ký, đăng nhập bằng tài khoản và Google Sign-In, giữ thông tin người dùng hiện tại (`user`).
- [onboarding-context.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/contexts/onboarding-context.tsx): Lưu trữ tạm thời các lựa chọn mục tiêu, sở thích của người dùng trong quá trình thiết lập ban đầu.
- [quiz-context.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/contexts/quiz-context.tsx): Quản lý trạng thái của lượt chơi Quiz hiện tại (điểm số, câu hỏi hiện tại, đáp án người dùng chọn, kết quả đúng/sai).

---

### 📂 `src/data/` (Dữ liệu mẫu tĩnh)
Chứa mock data chi tiết giúp ứng dụng hoạt động ngoại tuyến mượt mà:
- [lessons.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/lessons.ts): Các bài học từ vựng, ngữ pháp, bảng chữ cái Kanji/Hiragana/Katakana.
- [categories.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/categories.ts): Danh mục tìm kiếm từ vựng phổ biến.
- [quiz.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/quiz.ts): Kho câu hỏi đa dạng (kana, vocab, kanji fill, picture match).
- [dictionary.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/dictionary.ts): Bộ từ điển dịch nghĩa phong phú.
- [onboarding.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/onboarding.ts): Dữ liệu câu hỏi khảo sát sở thích, mục tiêu.
- [review.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/review.ts): Thống kê kỹ năng và tiến độ ôn tập tuần.

---

### 📂 `src/types/` (Định nghĩa TypeScript)
Định nghĩa rõ ràng các kiểu dữ liệu và ràng buộc kiểu cho toàn hệ thống:
- `api.ts`: Cấu trúc request/response của server.
- `dictionary.ts`: Định nghĩa từ vựng, kanji, ví dụ.
- `lesson.ts`: Kiểu dữ liệu bài học, chương học.
- `navigation.ts`: Kiểu định dạng định tuyến giữa các màn hình.
- `onboarding.ts`: Trạng thái khảo sát mục tiêu và sở thích.
- `quiz.ts`: Định nghĩa câu hỏi kiểm tra (Kana, Kanji, Picture, Vocab).
- `review.ts`: Dữ liệu cho luồng ôn tập kiến thức.
- `user.ts`: Mô hình dữ liệu tài khoản người dùng, tiến độ học tập và streak.

---

### 📂 Các thư mục phụ trợ khác
- **`config/`**: Quản lý biến môi trường và cấu hình như [google-auth.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/config/google-auth.ts) cho API Đăng nhập Google.
- **`constants/`**: Lưu trữ các biến bất biến của thiết kế như [theme.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/constants/theme.ts) (phục vụ Dark/Light mode).
- **`hooks/`**: Chứa hook tùy biến phục vụ âm thanh [use-audio.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/hooks/use-audio.ts) và quản lý theme hệ thống.
- **`locales/`**: i18n hỗ trợ hai ngôn ngữ: Tiếng Anh ([en.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/locales/en.ts)) và Tiếng Việt ([vi.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/locales/vi.ts)).
- **`services/`**: Các service lưu trữ cục bộ ([async-storage.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/services/storage/async-storage.ts)) và API client để đồng bộ hóa với backend.
- **`utils/`**: Các hàm trợ giúp thuần túy như định dạng dữ liệu và kiểm tra hợp lệ ([validation.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/utils/validation.ts)).

---

## 3. Mối quan hệ giữa các thành phần (Data & Logic Flow)

Mối liên kết giữa các file và tầng kiến trúc được vận hành theo cơ chế phân lớp chuẩn:

```mermaid
graph TD
    subgraph Tầng Định tuyến (app)
        A[index.tsx] -->|Kiểm tra Auth| B[welcome.tsx]
        A -->|Đã Auth| C[/(tabs)]
        B -->|Đăng ký/Đăng nhập| D[/(auth)]
        D -->|Hoàn tất đăng ký| E[/(onboarding)]
        E -->|Hoàn thành khảo sát| C
    end

    subgraph Tầng Quản lý Trạng thái (contexts)
        ContextAuth[auth-context.tsx]
        ContextOnboarding[onboarding-context.tsx]
        ContextQuiz[quiz-context.tsx]
    end

    subgraph Tầng Linh hồn Giao diện (components)
        UI[ui/ Components]
        LessonsComp[lessons/ Components]
        QuizComp[quiz/ Components]
        VoiceComp[voice/ Components]
    end

    subgraph Tầng Dữ liệu & Nghiệp vụ (data & services)
        MockData[data/ lessons, quiz...]
        Storage[services/ Local Storage]
        Types[types/ System Interfaces]
    end

    %% Mối quan hệ sử dụng
    C -->|Tiêu thụ| ContextAuth
    E -->|Cập nhật| ContextOnboarding
    C -->|Lấy bài học để vẽ Map| LessonsComp
    LessonsComp -->|Hiển thị thông tin| MockData
    
    %% Tương tác Quiz
    C -->|Bắt đầu học/kiểm tra| QuizRoute[quiz/id.tsx]
    QuizRoute -->|Quản lý luồng chơi| ContextQuiz
    ContextQuiz -->|Tải câu đố từ| MockData
    ContextQuiz -->|Render loại câu hỏi| QuizComp
    
    %% Áp dụng Type và UI chung
    UI -.->|Định dạng giao diện chung| LessonsComp & QuizComp & VoiceComp
    Types -.->|Ràng buộc kiểu dữ liệu| ContextAuth & ContextOnboarding & ContextQuiz & MockData
```

### Các mối quan hệ cụ thể tiêu biểu:

1. **Từ Định tuyến đến State Context:**
   - Các màn hình trong `src/app` sử dụng các Custom Hook tương ứng để lấy State. Ví dụ: `src/app/(tabs)/index.tsx` sử dụng thông tin tiến độ của người dùng để hiển thị đúng tiến độ bài học trên cây kỹ năng. Màn hình `src/app/quiz/[id].tsx` tiêu thụ `useQuiz()` từ `quiz-context.tsx` để điều khiển hành động lật trang câu hỏi.

2. **Từ Components đến Mock Data & Types:**
   - Component [lesson-grid.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/lesson-grid.tsx) import danh sách bài học tĩnh từ [lessons.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/lessons.ts) nhằm mục đích render cây bài học.
   - Các file trong `src/components/quiz/` nhận prop là các object có kiểu dữ liệu được định nghĩa chặt chẽ trong `src/types/quiz.ts` (ví dụ: `KanaQuestionProps`, `VocabQuestionProps`).

3. **Từ Helper/Services đến Components:**
   - Các service lưu trữ cục bộ ([async-storage.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/services/storage/async-storage.ts)) được gọi trong `auth-context.tsx` để duy trì trạng thái đăng nhập (persist user session) ngay cả khi ứng dụng bị tắt đi bật lại.
   - Các helper định dạng và validation ([validation.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/utils/validation.ts)) được dùng trong màn hình login/signup để xác thực tính hợp lệ của email/mật khẩu trước khi gửi yêu cầu xác thực.

---

## 4. Tiến trình Cập nhật & Nâng cấp Mới nhất (Mới)

Gần đây, dự án đã được tích hợp thêm nhiều công nghệ và tính năng quan trọng phục vụ trải nghiệm người dùng cao cấp:

### 🎭 Tích hợp Lottie Mascot Animation (Ảnh động linh vật tương tác)
- Đã cài đặt thư viện `lottie-react-native` để hiển thị các chuyển động vector mượt mà từ các tệp tin cấu hình JSON trong `assets/animations/`:
  - `hi_mascot.json` - Mascot chào mừng.
  - `school_mascot.json` - Mascot đồng hành trong bài học.
  - `happy_mascot.json` - Mascot chung vui khi hoàn thành bài tập tốt.
  - `confuse_mascot.json` - Mascot thắc mắc khi trả lời chưa chính xác.
  - `winner_mascot.json` - Mascot chúc mừng thành công.
- Các hoạt ảnh này được nhúng trực tiếp vào luồng chào mừng (`welcome.tsx`), đăng nhập (`login.tsx`), và làm bài test nhằm nâng cao tính cá nhân hóa và sự thân thiện của ứng dụng.

### 🔑 Xác thực bằng Tài khoản Google (Google Login API)
- Tích hợp thành công thư viện `@react-native-google-signin/google-signin` để hỗ trợ đăng nhập nhanh bằng tài khoản Google.
- Cấu hình client credentials thông qua [google-auth.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/config/google-auth.ts) và đưa logic xử lý vào trong [auth-context.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/contexts/auth-context.tsx).
- Xây dựng component [google-sign-in-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/auth/google-sign-in-button.tsx) tương thích tốt với giao diện thiết kế mới.

### 🎌 Hoàn thiện học bảng chữ cái & Luyện viết (Kana & Stroke Learning)
- Tái cấu trúc màn hình học bảng chữ cái [characters.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/(tabs)/characters.tsx) hỗ trợ chuyển đổi linh hoạt giữa hai bảng chữ Hiragana và Katakana.
- Tích hợp bảng vẽ nét chữ [writing-canvas.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/lessons/writing-canvas.tsx) cho phép vẽ nét chữ bằng ngón tay, kiểm tra tính chính xác của nét vẽ chữ Nhật trực tiếp trên thiết bị di động.
- Mở rộng ngân hàng câu hỏi câu đố hỗ trợ học ký tự trong [quiz.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/data/quiz.ts).

### ✨ Hệ thống Animation & Trải nghiệm Premium nâng cao
- Cập nhật định cấu hình chuyển cảnh mượt mà kiểu iOS `ios_from_right` ở các sub-layout để đem lại phản hồi tức thì và tự nhiên nhất.
- Nâng cấp các component chuyển động chuyên dụng:
  - [animated-pressable.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-pressable.tsx): Tránh việc nút bấm bị đơ giật bằng cách dùng thư viện `react-native-reanimated` với spring physics.
  - [animated-tab-icon.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-tab-icon.tsx): Tạo hiệu ứng glow nhẹ và chuyển động vi mô trên Tab Bar chính khi người dùng nhấn chuyển đổi màn hình.
  - [staggered-list.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/staggered-list.tsx): Tạo cảm giác mượt mà khi hiển thị thông tin bài học và bảng tin.
- Làm mới giao diện cho các màn hình Tab Bar (`feed.tsx`, `profile.tsx`, `review.tsx`, `leaderboard.tsx`) với phong cách tối giản cao cấp (Glassmorphism, Gradient tinh tế, Shadow phân tầng sâu).

---

## 5. Các vấn đề kỹ thuật đã được khắc phục & Dọn dẹp mã nguồn (Mới cập nhật)

Dự án vừa thực hiện một đợt quét toàn diện (TypeScript compiler check) và khắc phục thành công toàn bộ các lỗi biên dịch hiện tại:

### 🛠️ Chuẩn hóa Style Types trong Hệ thống Component dùng chung
- **Vấn đề:** Các thuộc tính `style` trong [animated-pressable.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/animated-pressable.tsx) và [gradient-button.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/ui/gradient-button.tsx) được khai báo kiểu dữ liệu thô (`ViewStyle` hoặc `ViewStyle[]`). Khi sử dụng với cấu trúc nối style có điều kiện (ví dụ: `[styles.base, condition && styles.active]`), TypeScript báo lỗi vì giá trị `false` (khi điều kiện sai) không khớp với kiểu `ViewStyle`.
- **Giải pháp:** Đổi kiểu dữ liệu sang `StyleProp<ViewStyle>` và `StyleProp<TextStyle>` chuẩn từ `react-native`, giúp tự động tương thích với các mảng style phức tạp và cấu trúc logic điều kiện.

### 🎨 Sửa lỗi tham chiếu Design System không tồn tại
- **Vấn đề:** Màn hình tìm kiếm bạn bè [search.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/friends/search.tsx) và chi tiết hồ sơ [[username].tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/app/friends/profile/%5Busername%5D.tsx) tham chiếu đến `Colors.border` và `BorderRadius.pill` - các hằng số không hề có trong file cấu hình hệ thống thiết kế [theme.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/constants/theme.ts).
- **Giải pháp:**
  - Thay thế `BorderRadius.pill` bằng `BorderRadius.full` (bo tròn hoàn toàn).
  - Thay thế `Colors.border` bằng hằng số hợp lệ `Colors.inputBorder` (ở các ô nhập liệu) và `Colors.lockedBg` (màu xám nhạt làm vách ngăn phân chia thông tin).

### 🌐 Khắc phục tương thích Web Component
- **Vấn đề:** Component [animated-icon.web.tsx](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/components/animated-icon.web.tsx) cố gắng import trực tiếp CSS Module `./animated-icon.module.css` vốn chưa được khai báo kiểu dữ liệu toàn cục, dẫn đến lỗi biên dịch TypeScript `TS2307: Cannot find module`.
- **Giải pháp:** Loại bỏ việc import tệp CSS Module và chuyển đổi thẻ `div` thuần sang sử dụng `<Animated.View>` có thuộc tính inline style của React Native Web (`backgroundImage: 'linear-gradient(...)'`), đảm bảo code sạch sẽ, tối ưu hiệu năng và tương thích TypeScript tuyệt đối.

### 🔌 Đồng bộ kiểu phản hồi của API Client
- **Vấn đề:** Trong [client.ts](file:///c:/Users/Endministrator/Pictures/Frontend-Native/src/services/api/client.ts), hàm `request<T>` trả về `undefined` đối với các phản hồi không có nội dung (như mã HTTP 204 No Content), gây lỗi TypeScript vì `undefined` không tương thích trực tiếp với kiểu generic `T`.
- **Giải pháp:** Ép kiểu trả về khi rỗng thành `undefined as any` để thỏa mãn bộ kiểm tra kiểu tĩnh mà không làm ảnh hưởng tới logic xử lý ở các tầng nghiệp vụ phía trên.

