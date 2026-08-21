# Seed dữ liệu Bảng chữ cái

Dữ liệu đầy đủ Hiragana + Katakana để nạp vào backend qua API admin, đúng định
dạng của `POST /api/v1/admin/alphabets/bulk`.

## Sinh lại dữ liệu

```bash
npm run seed:alphabets                                  # mặc định: có nét viết, không audio
npm run seed:alphabets -- --no-strokes                  # bỏ qua tải nét từ KanjiVG
npm run seed:alphabets -- --no-yoon                     # bỏ âm ghép (きゃ, しゅ...)
npm run seed:alphabets -- --audio-base=https://cdn.ban/audio
npm run seed:alphabets -- --audio=wikimedia             # audio test, xem cảnh báo bên dưới
```

SVG của KanjiVG được cache ở `scripts/.cache/kanjivg/`, chạy lại lần sau không
tải lại mạng.

## Nội dung

| File                     | Số chữ | Ghi chú                                        |
| ------------------------ | ------ | ---------------------------------------------- |
| `alphabet-hiragana.json` | 104    | 46 gojūon + 25 dakuten/handakuten + 33 âm ghép |
| `alphabet-katakana.json` | 104    | tương ứng                                      |
| `alphabet-all.json`      | 208    | gộp cả hai, dùng cho 1 lần POST duy nhất       |

- `strokeOrderData`: có cho **142 chữ đơn** (toàn bộ gojūon + dakuten của cả hai
  bảng). 66 âm ghép để `null` vì KanjiVG lưu theo từng ký tự đơn, không có sẵn
  tổ hợp 2 ký tự — app tự chuyển sang chế độ **viết tự do** cho các chữ này.
- `audioUrl`: mặc định `null`. App hiển thị "Chưa có audio" và không crash.
- `orderIndex`: đánh số 1..104 riêng cho từng `type`.
- `groupName`: "Hàng A", "Hàng K", ..., "Âm ghép K", ... (tiếng Việt, khớp ví dụ
  trong tài liệu BE).

## Nạp vào backend

Cần token của tài khoản admin:

```bash
curl -X POST "$API_URL/api/v1/admin/alphabets/bulk" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  --data-binary @scripts/seed/alphabet-all.json
```

Nếu backend giới hạn kích thước request, POST lần lượt hai file
`alphabet-hiragana.json` và `alphabet-katakana.json`.

## Cảnh báo về `--audio=wikimedia`

Cờ này trỏ `audioUrl` tới file phát âm trên Wikimedia Commons
(`Special:FilePath/Ja-<Romaji>.oga`). **Chỉ nên dùng để test:**

- Định dạng `.oga` (Ogg Vorbis) chạy trên Android nhưng **iOS không phát được**.
- Không phải romaji nào cũng có file → một số chữ sẽ 404 (app nuốt lỗi, không crash).
- Hotlink tài nguyên Wikimedia không phù hợp cho production — hãy tự host mp3 rồi
  dùng `--audio-base=`.

## Ghi công / giấy phép

Dữ liệu nét viết lấy từ **KanjiVG** (https://kanjivg.tagaini.net), Copyright ©
2009-2011 Ulrich Apel, phát hành theo giấy phép
[Creative Commons Attribution-Share Alike 3.0](http://creativecommons.org/licenses/by-sa/3.0/).

Giấy phép này yêu cầu: nếu bạn phát hành sản phẩm có dùng dữ liệu nét, phải **ghi
công KanjiVG kèm link tới website của họ**, và phần dữ liệu dẫn xuất phải giữ
giấy phép tương đương (share-alike). Hãy thêm dòng ghi công vào màn hình
"Giới thiệu"/"Credits" của app trước khi phát hành.
