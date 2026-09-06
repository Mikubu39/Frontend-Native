/**
 * Sổ tay Hướng dẫn Chủ đề (Unit Guidebooks) chuẩn Duolingo.
 * Tóm tắt ngữ pháp, bài học, từ vựng và câu then chốt cho 14 chủ đề.
 */

export interface GuideVocab {
  kana: string;
  romaji: string;
  vn: string;
  emoji?: string;
}

export interface GuideSentence {
  jp: string;
  romaji: string;
  vn: string;
}

export interface GuideLessonSummary {
  title: string;
  desc: string;
}

export interface TopicGuide {
  topicId: number;
  title: string;
  description: string;
  lessons: GuideLessonSummary[];
  keyVocab: GuideVocab[];
  keySentences: GuideSentence[];
}

export const TOPIC_GUIDES: Record<number, TopicGuide> = {
  "1": {
    topicId: 1,
    title: "Lời chào, tạm biệt",
    description:
      "Những câu chào và tạm biệt người Nhật dùng hàng chục lần mỗi ngày. Học xong chủ đề này bạn đã có thể chào hỏi theo đúng buổi, hỏi thăm sức khoẻ và tạm biệt đúng hoàn cảnh — từ bạn bè thân mật đến đồng nghiệp trang trọng.",
    lessons: [
      {
        title: "Bài 1: Chào cơ bản",
        desc: "Tiếng Nhật không có một câu chào dùng chung cho cả ngày như Xin chào của tiếng Việt. Chào sai buổi nghe rất kỳ, nên hãy nhớ mốc thời gian: おはよう cho buổi sáng, こんにちは cho trưa/chiều, こんばんは cho buổi tối.",
      },
      {
        title: "Bài 2: Chào theo buổi & tạm biệt thân mật",
        desc: "おはようございます là bản lịch sự của おはよう, dùng với người lớn tuổi hoặc cấp trên. またね và じゃあね chỉ dùng với bạn bè thân — nghe trang trọng quá với đồng nghiệp sẽ hơi kỳ.",
      },
      {
        title: "Bài 3: Tạm biệt trang trọng, ra vào nhà",
        desc: "4 câu いってきます / いってらっしゃい / ただいま / おかえりなさい đi thành 2 cặp hỏi - đáp cố định trong mọi gia đình Nhật. 失礼します nghe trang trọng hơn さようなら, dùng khi rời cuộc họp hoặc kết thúc cuộc gọi điện thoại.",
      },
      {
        title: "Bài 4: Chào trong bữa ăn & nơi làm việc",
        desc: "いただきます nói trước khi ăn (kể cả khi ăn một mình) để cảm ơn thức ăn, ごちそうさまでした nói sau khi ăn xong. お疲れ様です là câu chào phổ biến nhất trong công ty Nhật, dùng được cả khi gặp lẫn khi chia tay đồng nghiệp.",
      },
      {
        title: "Bài 5: Hỏi thăm khi chào",
        desc: "お元気ですか thường đi kèm ngay sau lời chào buổi sáng để hỏi thăm sức khoẻ. Trả lời 元気です nếu khoẻ, hoặc まあまあです nếu chỉ tạm ổn — người Nhật ít khi than phiền thẳng khi được hỏi thăm.",
      },
      {
        title: "Bài 6: Ôn tập tổng hợp",
        desc: "Ghép lại toàn bộ các câu chào, hỏi thăm và tạm biệt đã học thành các đoạn hội thoại ngắn hoàn chỉnh — đúng như cách người Nhật thật sự dùng chúng liên tiếp nhau trong một cuộc gặp gỡ.",
      },
    ],
    keyVocab: [
      {
        kana: "おはよう",
        romaji: "ohayou",
        vn: "chào buổi sáng",
        emoji: "🌅",
      },
      {
        kana: "こんにちは",
        romaji: "konnichiwa",
        vn: "chào (buổi trưa/chiều)",
        emoji: "☀️",
      },
      {
        kana: "こんばんは",
        romaji: "konbanwa",
        vn: "chào buổi tối",
        emoji: "🌙",
      },
      {
        kana: "さようなら",
        romaji: "sayounara",
        vn: "tạm biệt (trang trọng)",
        emoji: "👋",
      },
      {
        kana: "またね",
        romaji: "mata ne",
        vn: "hẹn gặp lại (thân mật)",
        emoji: "🔁",
      },
      {
        kana: "お休みなさい",
        romaji: "oyasuminasai",
        vn: "chúc ngủ ngon",
        emoji: "😴",
      },
      {
        kana: "いってきます",
        romaji: "itte kimasu",
        vn: "con đi đây",
        emoji: "🚶",
      },
      {
        kana: "ただいま",
        romaji: "tadaima",
        vn: "con về rồi",
        emoji: "🏠",
      },
      {
        kana: "お疲れ様です",
        romaji: "otsukaresama desu",
        vn: "cảm ơn vì đã vất vả",
        emoji: "🤝",
      },
      {
        kana: "お元気ですか",
        romaji: "ogenki desu ka",
        vn: "bạn khoẻ không?",
        emoji: "🙋",
      },
    ],
    keySentences: [
      {
        jp: "せんせい、おはようございます。",
        romaji: "Sensei, ohayou gozaimasu.",
        vn: "Chào buổi sáng ạ, thưa thầy.",
      },
      {
        jp: "また明日。じゃあね。",
        romaji: "Mata ashita. Jaa ne.",
        vn: "Hẹn gặp ngày mai. Tạm biệt nhé.",
      },
      {
        jp: "いってきます。",
        romaji: "Itte kimasu.",
        vn: "Con đi đây.",
      },
      {
        jp: "ただいま。おかえりなさい。",
        romaji: "Tadaima. Okaerinasai.",
        vn: "Con về rồi. Chào mừng về nhà.",
      },
      {
        jp: "いただきます。ごちそうさまでした。",
        romaji: "Itadakimasu. Gochisousama deshita.",
        vn: "Mời (dùng bữa). Cảm ơn vì bữa ăn.",
      },
      {
        jp: "お元気ですか。まあまあです。",
        romaji: "Ogenki desu ka. Maamaa desu.",
        vn: "Bạn khoẻ không? Cũng tạm ổn.",
      },
    ],
  },
  "2": {
    topicId: 2,
    title: "Gọi đồ ăn, đồ uống",
    description:
      "Từ vựng đồ ăn, đồ uống cơ bản và mẫu câu gọi món ở quán ăn Nhật. Hết chủ đề này bạn tự gọi được món, hỏi giá và thanh toán mà không cần biết nhiều ngữ pháp phức tạp.",
    lessons: [
      {
        title: "Bài 1: Từ vựng cơ bản",
        desc: "5 từ nền tảng nhất khi đi ăn: お茶 (trà), ご飯 (cơm), 水 (nước), パン (bánh mì), コーヒー (cà phê). Đây là những từ xuất hiện trong hầu hết mọi thực đơn quán ăn Nhật.",
      },
      {
        title: "Bài 2: Gọi món cơ bản",
        desc: "Mẫu câu quan trọng nhất chương này: [Món] をください = Cho tôi xin [món]. を là trợ từ đánh dấu tân ngữ, đọc là O chứ không phải WO. Chỉ cần thay tên món là gọi được bất cứ thứ gì.",
      },
      {
        title: "Bài 3: Mở rộng thực đơn",
        desc: "お願いします lịch sự hơn ください một chút, thường dùng khi gọi món qua nhân viên phục vụ thay vì tự lấy. と nối 2 danh từ nghĩa là và: 卵と野菜 = trứng và rau.",
      },
      {
        title: "Bài 4: Hỏi giá & đặt món hoàn chỉnh",
        desc: "これはいくらですか (cái này bao nhiêu tiền?) và お会計をお願いします (cho tôi tính tiền) là 2 câu bắt buộc phải thuộc trước khi vào quán ăn Nhật. すみません dùng để gọi phục vụ lại gần bàn.",
      },
      {
        title: "Bài 5: Gọi nhiều món cùng lúc",
        desc: "Ghép nhiều món bằng と rồi thêm をください/をお願いします ở cuối cùng: お茶と寿司をください = Cho tôi trà và sushi. Không cần lặp lại を/ください cho từng món.",
      },
      {
        title: "Bài 6: Ôn tập hội thoại gọi món",
        desc: "Ghép toàn bộ mẫu câu đã học thành một lượt gọi món hoàn chỉnh tại quán: gọi phục vụ, xem thực đơn, đặt món, hỏi giá và thanh toán — đúng trình tự một bữa ăn thật.",
      },
    ],
    keyVocab: [
      {
        kana: "お茶",
        romaji: "ocha",
        vn: "trà",
        emoji: "🍵",
      },
      {
        kana: "ご飯",
        romaji: "gohan",
        vn: "cơm",
        emoji: "🍚",
      },
      {
        kana: "水",
        romaji: "mizu",
        vn: "nước",
        emoji: "💧",
      },
      {
        kana: "パン",
        romaji: "pan",
        vn: "bánh mì",
        emoji: "🍞",
      },
      {
        kana: "コーヒー",
        romaji: "koohii",
        vn: "cà phê",
        emoji: "☕",
      },
      {
        kana: "寿司",
        romaji: "sushi",
        vn: "sushi",
        emoji: "🍣",
      },
      {
        kana: "ください",
        romaji: "kudasai",
        vn: "cho tôi (xin)",
        emoji: "🙏",
      },
      {
        kana: "お願いします",
        romaji: "onegaishimasu",
        vn: "làm ơn (lịch sự)",
        emoji: "🙇",
      },
      {
        kana: "いくらですか",
        romaji: "ikura desu ka",
        vn: "bao nhiêu tiền?",
        emoji: "💰",
      },
      {
        kana: "お会計",
        romaji: "okaikei",
        vn: "tính tiền",
        emoji: "🧾",
      },
    ],
    keySentences: [
      {
        jp: "お茶をください。",
        romaji: "Ocha o kudasai.",
        vn: "Cho tôi xin trà.",
      },
      {
        jp: "ラーメンをお願いします。",
        romaji: "Raamen o onegaishimasu.",
        vn: "Cho tôi ramen.",
      },
      {
        jp: "すみません、メニューをください。",
        romaji: "Sumimasen, menyuu o kudasai.",
        vn: "Xin lỗi, cho tôi xin thực đơn.",
      },
      {
        jp: "これはいくらですか。",
        romaji: "Kore wa ikura desu ka.",
        vn: "Cái này bao nhiêu tiền?",
      },
      {
        jp: "お茶と寿司をください。",
        romaji: "Ocha to sushi o kudasai.",
        vn: "Cho tôi trà và sushi.",
      },
      {
        jp: "すみません、お会計をお願いします。",
        romaji: "Sumimasen, okaikei o onegaishimasu.",
        vn: "Xin lỗi, cho tôi tính tiền.",
      },
    ],
  },
  "3": {
    topicId: 3,
    title: "Số đếm, tuổi và giá tiền",
    description:
      "Con số là thứ bạn dùng ngay ngày đầu đặt chân tới Nhật: xem giá, trả tiền, nói tuổi, đọc số điện thoại. Chủ đề này đi từ số 1 đến hàng vạn, kèm các đơn vị đếm hay dùng nhất.",
    lessons: [
      {
        title: "Bài 1: Số từ 1 đến 10",
        desc: "4 và 7 có 2 cách đọc: よん/し và なな/しち. Người Nhật thường dùng よん và なな vì し trùng âm với từ chết (死) — kiêng kỵ giống số 13 của phương Tây.",
      },
      {
        title: "Bài 2: Số từ 11 đến 100",
        desc: "Cách ghép số của tiếng Nhật rất logic, không có từ bất quy tắc như eleven, twelve của tiếng Anh: 11 = 10+1 = じゅういち, 20 = 2×10 = にじゅう, 35 = 3×10+5 = さんじゅうご. Nắm 10 số đầu là đọc được tới 99.",
      },
      {
        title: "Bài 3: Số lớn — trăm, nghìn, vạn",
        desc: "Tiếng Nhật đếm theo đơn vị VẠN (まん = 10.000) chứ không theo nghìn như tiếng Việt. 100.000 đồng người Nhật đọc là じゅうまん (10 vạn). Đây là chỗ người Việt hay nhầm nhất khi nghe giá tiền.",
      },
      {
        title: "Bài 4: Tuổi và số điện thoại",
        desc: "Tuổi dùng đuôi さい. Có 3 trường hợp đọc bất quy tắc phải học thuộc: 1 tuổi いっさい, 8 tuổi はっさい, 20 tuổi はたち (không phải にじゅっさい). Đọc số điện thoại thì đọc rời từng số, dấu gạch ngang đọc là の.",
      },
      {
        title: "Bài 5: Hỏi giá và mua hàng",
        desc: "いくらですか là câu bạn sẽ dùng nhiều nhất khi đi mua sắm ở Nhật. Đồng yên viết là えん (円). Khi muốn mua, chỉ cần chỉ vào món đồ và nói これをください.",
      },
      {
        title: "Bài 6: Đơn vị đếm đồ vật",
        desc: "Tiếng Nhật không đếm suông mà phải kèm đơn vị theo hình dạng vật: まい cho vật mỏng dẹt (giấy, áo, vé), ほん cho vật dài (bút, chai, ô), にん cho người, còn つ là đơn vị vạn năng dùng khi bạn quên mất đơn vị đúng.",
      },
    ],
    keyVocab: [
      {
        kana: "いち",
        romaji: "ichi",
        vn: "số 1",
        emoji: "1️⃣",
      },
      {
        kana: "に",
        romaji: "ni",
        vn: "số 2",
        emoji: "2️⃣",
      },
      {
        kana: "さん",
        romaji: "san",
        vn: "số 3",
        emoji: "3️⃣",
      },
      {
        kana: "よん",
        romaji: "yon",
        vn: "số 4",
        emoji: "4️⃣",
      },
      {
        kana: "ご",
        romaji: "go",
        vn: "số 5",
        emoji: "5️⃣",
      },
      {
        kana: "ろく",
        romaji: "roku",
        vn: "số 6",
        emoji: "6️⃣",
      },
      {
        kana: "なな",
        romaji: "nana",
        vn: "số 7",
        emoji: "7️⃣",
      },
      {
        kana: "はち",
        romaji: "hachi",
        vn: "số 8",
        emoji: "8️⃣",
      },
      {
        kana: "きゅう",
        romaji: "kyuu",
        vn: "số 9",
        emoji: "9️⃣",
      },
      {
        kana: "じゅう",
        romaji: "juu",
        vn: "số 10",
        emoji: "🔟",
      },
    ],
    keySentences: [
      {
        jp: "いち、に、さん、よん、ご。",
        romaji: "Ichi, ni, san, yon, go.",
        vn: "Một, hai, ba, bốn, năm.",
      },
      {
        jp: "じゅうごとにじゅうご。",
        romaji: "Juugo to nijuugo.",
        vn: "Mười lăm và hai mươi lăm.",
      },
      {
        jp: "ごひゃくえんです。",
        romaji: "Gohyaku en desu.",
        vn: "Là 500 yên.",
      },
      {
        jp: "いちまんえんです。",
        romaji: "Ichiman en desu.",
        vn: "Là 10.000 yên.",
      },
      {
        jp: "わたしははたちです。",
        romaji: "Watashi wa hatachi desu.",
        vn: "Tôi 20 tuổi.",
      },
      {
        jp: "でんわばんごうはなんばんですか。",
        romaji: "Denwa bangou wa nanban desu ka.",
        vn: "Số điện thoại của bạn là số mấy?",
      },
    ],
  },
  "4": {
    topicId: 4,
    title: "Đồ vật quanh ta",
    description:
      "Bộ chỉ định これ・それ・あれ và cách hỏi tên đồ vật. Đây là chủ đề giúp bạn tự học từ vựng suốt đời: chỉ vào bất cứ thứ gì và hỏi これはなんですか.",
    lessons: [
      {
        title: "Bài 1: これ・それ・あれ・どれ",
        desc: "3 từ chỉ định chia theo khoảng cách: これ = cái này (gần người nói), それ = cái đó (gần người nghe), あれ = cái kia (xa cả hai). どれ = cái nào. Tiếng Việt chỉ có 2 mức nên hãy chú ý mức giữa それ.",
      },
      {
        title: "Bài 2: Đồ dùng học tập",
        desc: "Từ vựng trong cặp sách. Để ý ノート và ペン viết bằng Katakana vì là từ mượn tiếng Anh, còn ほん và えんぴつ là từ thuần Nhật nên viết Hiragana.",
      },
      {
        title: "Bài 3: Đồ dùng hằng ngày",
        desc: "Những vật bạn mang theo mỗi khi ra khỏi nhà. かさ (ô) là vật cực kỳ quan trọng ở Nhật vì mưa rất thất thường — cửa hàng tiện lợi nào cũng bán.",
      },
      {
        title: "Bài 4: この・その・あの + danh từ",
        desc: "Khác biệt quan trọng: これ đứng MỘT MÌNH (cái này), còn この phải có danh từ đi kèm ngay sau (この本 = quyển sách này). Nói このです là sai ngữ pháp, và nói これ本 cũng sai.",
      },
      {
        title: "Bài 5: Đồ này của ai?",
        desc: "Khi đã rõ đang nói về vật gì, người Nhật lược bỏ luôn danh từ sau の: わたしのです = (cái này) của tôi. Cách nói tỉnh lược này rất phổ biến trong hội thoại đời thường.",
      },
      {
        title: "Bài 6: Hỏi tên đồ vật",
        desc: "これはなんですか là chiếc chìa khóa để tự học từ vựng khi ở Nhật: chỉ vào vật lạ bất kỳ và hỏi. Khi trả lời sai, người Nhật lịch sự sẽ nói ちがいます chứ ít khi nói thẳng là bạn sai.",
      },
    ],
    keyVocab: [
      {
        kana: "これ",
        romaji: "kore",
        vn: "cái này",
        emoji: "👇",
      },
      {
        kana: "それ",
        romaji: "sore",
        vn: "cái đó",
        emoji: "👉",
      },
      {
        kana: "あれ",
        romaji: "are",
        vn: "cái kia",
        emoji: "👆",
      },
      {
        kana: "どれ",
        romaji: "dore",
        vn: "cái nào",
        emoji: "❔",
      },
      {
        kana: "ほん",
        romaji: "hon",
        vn: "quyển sách",
        emoji: "📖",
      },
      {
        kana: "ノート",
        romaji: "nooto",
        vn: "quyển vở",
        emoji: "📓",
      },
      {
        kana: "えんぴつ",
        romaji: "enpitsu",
        vn: "bút chì",
        emoji: "✏️",
      },
      {
        kana: "ペン",
        romaji: "pen",
        vn: "cây bút",
        emoji: "🖊️",
      },
      {
        kana: "けしゴム",
        romaji: "keshigomu",
        vn: "cục tẩy",
        emoji: "🧽",
      },
      {
        kana: "かばん",
        romaji: "kaban",
        vn: "cái cặp",
        emoji: "🎒",
      },
    ],
    keySentences: [
      {
        jp: "これはほんです。",
        romaji: "Kore wa hon desu.",
        vn: "Đây là quyển sách.",
      },
      {
        jp: "それはなんですか。",
        romaji: "Sore wa nan desu ka.",
        vn: "Cái đó là cái gì vậy?",
      },
      {
        jp: "これはわたしのじしょです。",
        romaji: "Kore wa watashi no jisho desu.",
        vn: "Đây là từ điển của tôi.",
      },
      {
        jp: "あれはたなかさんのかさです。",
        romaji: "Are wa Tanaka-san no kasa desu.",
        vn: "Cái kia là ô của anh Tanaka.",
      },
      {
        jp: "このほんはたかいです。",
        romaji: "Kono hon wa takai desu.",
        vn: "Quyển sách này đắt.",
      },
      {
        jp: "あのかばんはやすいです。",
        romaji: "Ano kaban wa yasui desu.",
        vn: "Cái cặp kia rẻ.",
      },
    ],
  },
  "5": {
    topicId: 5,
    title: "Địa điểm và vị trí",
    description:
      "Hỏi đường, chỉ chỗ, nói vật gì nằm ở đâu. Chủ đề này gồm cả cặp động từ あります và います — điểm ngữ pháp mà người mới học hay dùng sai nhất.",
    lessons: [
      {
        title: "Bài 1: ここ・そこ・あそこ・どこ",
        desc: "Giống bộ これ・それ・あれ nhưng dùng cho ĐỊA ĐIỂM: ここ = chỗ này, そこ = chỗ đó, あそこ = chỗ kia, どこ = chỗ nào. Nhận ra quy luật ko-so-a-do rồi thì bạn học các bộ từ chỉ định còn lại rất nhanh.",
      },
      {
        title: "Bài 2: Địa điểm trong thành phố",
        desc: "Những nơi bạn cần tìm nhất khi mới sang Nhật. コンビニ (cửa hàng tiện lợi) là từ rút gọn của convenience store — người Nhật rất hay rút gọn từ mượn dài.",
      },
      {
        title: "Bài 3: Các phòng trong nhà",
        desc: "Nhà Nhật tách riêng おふろ (phòng tắm) và トイレ (nhà vệ sinh) thành 2 phòng khác nhau — hỏi nhầm phòng là chuyện thường gặp của người nước ngoài.",
      },
      {
        title: "Bài 4: あります và います",
        desc: "Cùng nghĩa là CÓ nhưng chia theo sự sống: います dùng cho người và động vật (vật biết tự di chuyển), あります dùng cho đồ vật và cây cối. Nói ねこがあります là sai — mèo phải dùng います.",
      },
      {
        title: "Bài 5: Từ chỉ vị trí",
        desc: "Cấu trúc: A の + từ vị trí + に. Ví dụ つくえのうえに = ở trên bàn. Thứ tự ngược với tiếng Việt: vật mốc đứng trước, vị trí đứng sau.",
      },
      {
        title: "Bài 6: Hỏi đường",
        desc: "Công thức hỏi đường an toàn nhất: mở đầu bằng すみません để gây chú ý, rồi hỏi 〜はどこですか. Kết thúc luôn nhớ nói ありがとうございます — người Nhật rất coi trọng lời cảm ơn sau khi được giúp.",
      },
    ],
    keyVocab: [
      {
        kana: "ここ",
        romaji: "koko",
        vn: "chỗ này",
        emoji: "📍",
      },
      {
        kana: "そこ",
        romaji: "soko",
        vn: "chỗ đó",
        emoji: "📌",
      },
      {
        kana: "あそこ",
        romaji: "asoko",
        vn: "chỗ kia",
        emoji: "🗺️",
      },
      {
        kana: "どこ",
        romaji: "doko",
        vn: "chỗ nào, ở đâu",
        emoji: "❔",
      },
      {
        kana: "えき",
        romaji: "eki",
        vn: "nhà ga",
        emoji: "🚉",
      },
      {
        kana: "びょういん",
        romaji: "byouin",
        vn: "bệnh viện",
        emoji: "🏥",
      },
      {
        kana: "がっこう",
        romaji: "gakkou",
        vn: "trường học",
        emoji: "🏫",
      },
      {
        kana: "ぎんこう",
        romaji: "ginkou",
        vn: "ngân hàng",
        emoji: "🏦",
      },
      {
        kana: "コンビニ",
        romaji: "konbini",
        vn: "cửa hàng tiện lợi",
        emoji: "🏪",
      },
      {
        kana: "レストラン",
        romaji: "resutoran",
        vn: "nhà hàng",
        emoji: "🍽️",
      },
    ],
    keySentences: [
      {
        jp: "トイレはどこですか。",
        romaji: "Toire wa doko desu ka.",
        vn: "Nhà vệ sinh ở đâu ạ?",
      },
      {
        jp: "あそこです。",
        romaji: "Asoko desu.",
        vn: "Ở đằng kia.",
      },
      {
        jp: "えきはどこですか。",
        romaji: "Eki wa doko desu ka.",
        vn: "Nhà ga ở đâu ạ?",
      },
      {
        jp: "コンビニはそこです。",
        romaji: "Konbini wa soko desu.",
        vn: "Cửa hàng tiện lợi ở chỗ đó.",
      },
      {
        jp: "だいどころはここです。",
        romaji: "Daidokoro wa koko desu.",
        vn: "Nhà bếp ở chỗ này.",
      },
      {
        jp: "へやにねこがいます。",
        romaji: "Heya ni neko ga imasu.",
        vn: "Trong phòng có con mèo.",
      },
    ],
  },
  "6": {
    topicId: 6,
    title: "Thời gian và lịch",
    description:
      "Xem giờ, hẹn giờ, nói thứ ngày tháng. Người Nhật cực kỳ đúng giờ nên đây là chủ đề bắt buộc phải chắc trước khi đi làm hay đi học ở Nhật.",
    lessons: [
      {
        title: "Bài 1: Xem giờ (〜じ)",
        desc: "Ghép số + じ là ra giờ. Nhưng có 3 giờ đọc bất quy tắc phải học thuộc lòng: 4 giờ là よじ (không phải よんじ), 7 giờ là しちじ, 9 giờ là くじ (không phải きゅうじ).",
      },
      {
        title: "Bài 2: Phút và giờ rưỡi",
        desc: "Đuôi phút biến âm theo số đứng trước: いっぷん, にふん, さんぷん, よんぷん, ごふん. Quy luật chung là sau các số 1, 3, 6, 8, 10 thì đọc ぷん. Giờ rưỡi dùng はん cho gọn: しちじはん = 7 giờ rưỡi.",
      },
      {
        title: "Bài 3: Buổi trong ngày, hôm qua và ngày mai",
        desc: "Nhóm từ chỉ mốc thời gian tương đối. Chú ý あさ (buổi sáng) khác với あした (ngày mai) chỉ 1 chữ — người mới học rất hay nhầm 2 từ này.",
      },
      {
        title: "Bài 4: Thứ trong tuần",
        desc: "Tên các thứ đặt theo ngũ hành và thiên thể: nguyệt (trăng), hỏa, thủy, mộc, kim, thổ, nhật (mặt trời). Đều kết thúc bằng ようび nên chỉ cần nhớ chữ đầu.",
      },
      {
        title: "Bài 5: Tháng và ngày",
        desc: "Tháng rất dễ: số + がつ (いちがつ = tháng 1). Nhưng ngày mùng 1 đến mùng 10 đọc hoàn toàn bất quy tắc (ついたち, ふつか, みっか…) — đây là phần khó nhằn nhất của lịch tiếng Nhật, cần luyện đi luyện lại.",
      },
      {
        title: "Bài 6: Từ… đến… (〜から〜まで)",
        desc: "から = từ (điểm bắt đầu), まで = đến (điểm kết thúc). Dùng được cho cả thời gian lẫn địa điểm: くじからごじまで (từ 9 giờ đến 5 giờ), とうきょうからおおさかまで (từ Tokyo đến Osaka).",
      },
    ],
    keyVocab: [
      {
        kana: "いちじ",
        romaji: "ichiji",
        vn: "1 giờ",
        emoji: "🕐",
      },
      {
        kana: "さんじ",
        romaji: "sanji",
        vn: "3 giờ",
        emoji: "🕒",
      },
      {
        kana: "よじ",
        romaji: "yoji",
        vn: "4 giờ (bất quy tắc)",
        emoji: "🕓",
      },
      {
        kana: "しちじ",
        romaji: "shichiji",
        vn: "7 giờ (bất quy tắc)",
        emoji: "🕖",
      },
      {
        kana: "くじ",
        romaji: "kuji",
        vn: "9 giờ (bất quy tắc)",
        emoji: "🕘",
      },
      {
        kana: "じゅうにじ",
        romaji: "juuniji",
        vn: "12 giờ",
        emoji: "🕛",
      },
      {
        kana: "なんじ",
        romaji: "nanji",
        vn: "mấy giờ",
        emoji: "❓",
      },
      {
        kana: "ごふん",
        romaji: "gofun",
        vn: "5 phút",
        emoji: "⏱️",
      },
      {
        kana: "じゅっぷん",
        romaji: "juppun",
        vn: "10 phút",
        emoji: "⏱️",
      },
      {
        kana: "さんじゅっぷん",
        romaji: "sanjuppun",
        vn: "30 phút",
        emoji: "⏱️",
      },
    ],
    keySentences: [
      {
        jp: "いまなんじですか。",
        romaji: "Ima nanji desu ka.",
        vn: "Bây giờ là mấy giờ?",
      },
      {
        jp: "くじです。",
        romaji: "Kuji desu.",
        vn: "Là 9 giờ.",
      },
      {
        jp: "しちじはんです。",
        romaji: "Shichiji han desu.",
        vn: "Bây giờ là 7 giờ rưỡi.",
      },
      {
        jp: "さんじじゅっぷんです。",
        romaji: "Sanji juppun desu.",
        vn: "Bây giờ là 3 giờ 10 phút.",
      },
      {
        jp: "まいにちあさろくじにおきます。",
        romaji: "Mainichi asa rokuji ni okimasu.",
        vn: "Hằng ngày tôi dậy lúc 6 giờ sáng.",
      },
      {
        jp: "きょうはなんようびですか。",
        romaji: "Kyou wa nanyoubi desu ka.",
        vn: "Hôm nay là thứ mấy?",
      },
    ],
  },
  "7": {
    topicId: 7,
    title: "Động từ và sinh hoạt hằng ngày",
    description:
      "Động từ thể ます — thể lịch sự chuẩn mực để nói chuyện với bất kỳ ai. Chủ đề này cũng dạy 4 trợ từ quan trọng nhất khi ghép câu có động từ: を, へ, で, に.",
    lessons: [
      {
        title: "Bài 1: Động từ đầu tiên",
        desc: "Điểm khác biệt lớn nhất với tiếng Việt: động từ tiếng Nhật luôn đứng CUỐI CÂU. Tôi ăn cơm trong tiếng Nhật là Tôi cơm ăn. Đuôi ます làm câu thành lịch sự và mang nghĩa hiện tại hoặc tương lai.",
      },
      {
        title: "Bài 2: Đi, đến, về nhà",
        desc: "Bộ 3 động từ di chuyển đi kèm trợ từ へ (chỉ hướng, viết là へ nhưng đọc là E). Cấu trúc: [nơi đến] へ いきます. Có thể thay へ bằng に, nghĩa gần như nhau.",
      },
      {
        title: "Bài 3: Trợ từ を (tân ngữ)",
        desc: "を đánh dấu đối tượng chịu tác động của động từ. Chữ を chỉ dùng đúng cho việc này, không bao giờ dùng để viết từ, và đọc là O chứ không phải WO. Cấu trúc: [vật] を [động từ].",
      },
      {
        title: "Bài 4: Trợ từ で (nơi diễn ra hành động)",
        desc: "Phân biệt cực quan trọng: に chỉ nơi TỒN TẠI (へやにいます = ở trong phòng), còn で chỉ nơi DIỄN RA HÀNH ĐỘNG (へやでべんきょうします = học trong phòng). Dùng nhầm 2 trợ từ này là lỗi kinh điển của người mới.",
      },
      {
        title: "Bài 5: Quá khứ và phủ định",
        desc: "Chia động từ tiếng Nhật cực kỳ đều đặn, chỉ cần đổi đuôi ます: hiện tại ます → phủ định ません → quá khứ ました → quá khứ phủ định ませんでした. Không đổi theo ngôi hay số nhiều như tiếng Anh.",
      },
      {
        title: "Bài 6: Trợ từ に (mốc thời gian)",
        desc: "に đứng sau mốc thời gian CÓ CON SỐ: しちじにおきます (dậy lúc 7 giờ). Nhưng các từ như きょう, あした, まいにち thì KHÔNG dùng に — nói あしたにいきます là sai, phải nói あしたいきます.",
      },
      {
        title: "Bài 7: Kể về một ngày của bạn",
        desc: "Bài tổng hợp: ghép tất cả trợ từ và động từ đã học thành một đoạn kể liền mạch. Trật tự câu chuẩn của tiếng Nhật là: [Thời gian] [Nơi chốn] [Tân ngữ] [Động từ].",
      },
    ],
    keyVocab: [
      {
        kana: "おきます",
        romaji: "okimasu",
        vn: "thức dậy",
        emoji: "⏰",
      },
      {
        kana: "ねます",
        romaji: "nemasu",
        vn: "đi ngủ",
        emoji: "😴",
      },
      {
        kana: "たべます",
        romaji: "tabemasu",
        vn: "ăn",
        emoji: "🍚",
      },
      {
        kana: "のみます",
        romaji: "nomimasu",
        vn: "uống",
        emoji: "🥤",
      },
      {
        kana: "みます",
        romaji: "mimasu",
        vn: "xem, nhìn",
        emoji: "👀",
      },
      {
        kana: "ききます",
        romaji: "kikimasu",
        vn: "nghe",
        emoji: "🎧",
      },
      {
        kana: "いきます",
        romaji: "ikimasu",
        vn: "đi",
        emoji: "🚶",
      },
      {
        kana: "きます",
        romaji: "kimasu",
        vn: "đến",
        emoji: "🏃",
      },
      {
        kana: "かえります",
        romaji: "kaerimasu",
        vn: "về nhà",
        emoji: "🏠",
      },
      {
        kana: "へ",
        romaji: "e",
        vn: "đến (chỉ hướng)",
        emoji: "➡️",
      },
    ],
    keySentences: [
      {
        jp: "わたしはねます。",
        romaji: "Watashi wa nemasu.",
        vn: "Tôi đi ngủ.",
      },
      {
        jp: "がっこうへいきます。",
        romaji: "Gakkou e ikimasu.",
        vn: "Tôi đi đến trường.",
      },
      {
        jp: "うちへかえります。",
        romaji: "Uchi e kaerimasu.",
        vn: "Tôi về nhà.",
      },
      {
        jp: "ごはんをたべます。",
        romaji: "Gohan wo tabemasu.",
        vn: "Tôi ăn cơm.",
      },
      {
        jp: "おんがくをききます。",
        romaji: "Ongaku wo kikimasu.",
        vn: "Tôi nghe nhạc.",
      },
      {
        jp: "としょかんでべんきょうします。",
        romaji: "Toshokan de benkyou shimasu.",
        vn: "Tôi học bài ở thư viện.",
      },
    ],
  },
  "8": {
    topicId: 8,
    title: "Ăn uống và nhà hàng",
    description:
      "Từ vựng món ăn, đồ uống và trọn bộ mẫu câu để gọi món, hỏi giá, khen ngon. Chủ đề thực dụng nhất — dùng được ngay trong bữa ăn đầu tiên ở Nhật.",
    lessons: [
      {
        title: "Bài 1: Thức ăn cơ bản",
        desc: "Nhóm từ nền tảng trong mọi thực đơn. ごはん vừa có nghĩa là cơm trắng, vừa có nghĩa là bữa ăn nói chung — tuỳ ngữ cảnh mà hiểu.",
      },
      {
        title: "Bài 2: Đồ uống",
        desc: "Chữ お ở đầu おちゃ, おさけ là tiếp đầu ngữ lịch sự — bỏ đi vẫn đúng nghĩa nhưng nghe kém trang trọng. Người Nhật hầu như luôn nói kèm お cho 2 từ này.",
      },
      {
        title: "Bài 3: Món ăn Nhật Bản",
        desc: "Những món bạn sẽ thấy ở mọi nhà hàng Nhật. おにぎり là món ăn nhanh quốc dân, bán ở mọi cửa hàng tiện lợi với giá chỉ hơn 100 yên.",
      },
      {
        title: "Bài 4: Gọi món trong nhà hàng",
        desc: "2 cách gọi món: 〜をください (cho tôi…) dùng khi chỉ vào món cụ thể, còn 〜をおねがいします lịch sự hơn một bậc, dùng được cả khi nhờ vả việc khác.",
      },
      {
        title: "Bài 5: Nói về mùi vị",
        desc: "おいしい (ngon) là lời khen được dùng nhiều nhất trên bàn ăn Nhật. Ngược lại まずい (dở) nghe khá thô lỗ nếu nói trước mặt người nấu — người Nhật thường tránh né bằng cách nói ちょっと… (hơi… ).",
      },
      {
        title: "Bài 6: Hội thoại trong nhà hàng",
        desc: "Ghép toàn bộ mẫu câu đã học thành một cuộc hội thoại hoàn chỉnh từ lúc bước vào đến lúc trả tiền. いらっしゃいませ là câu nhân viên chào khách — bạn không cần đáp lại, chỉ cần gật đầu.",
      },
    ],
    keyVocab: [
      {
        kana: "ごはん",
        romaji: "gohan",
        vn: "cơm",
        emoji: "🍚",
      },
      {
        kana: "パン",
        romaji: "pan",
        vn: "bánh mì",
        emoji: "🍞",
      },
      {
        kana: "にく",
        romaji: "niku",
        vn: "thịt",
        emoji: "🍖",
      },
      {
        kana: "さかな",
        romaji: "sakana",
        vn: "cá",
        emoji: "🐟",
      },
      {
        kana: "たまご",
        romaji: "tamago",
        vn: "trứng",
        emoji: "🥚",
      },
      {
        kana: "やさい",
        romaji: "yasai",
        vn: "rau củ",
        emoji: "🥬",
      },
      {
        kana: "くだもの",
        romaji: "kudamono",
        vn: "trái cây",
        emoji: "🍎",
      },
      {
        kana: "みず",
        romaji: "mizu",
        vn: "nước lọc",
        emoji: "💧",
      },
      {
        kana: "おちゃ",
        romaji: "ocha",
        vn: "trà",
        emoji: "🍵",
      },
      {
        kana: "コーヒー",
        romaji: "koohii",
        vn: "cà phê",
        emoji: "☕",
      },
    ],
    keySentences: [
      {
        jp: "あさごはんにパンをたべます。",
        romaji: "Asagohan ni pan wo tabemasu.",
        vn: "Bữa sáng tôi ăn bánh mì.",
      },
      {
        jp: "おちゃをのみます。",
        romaji: "Ocha wo nomimasu.",
        vn: "Tôi uống trà.",
      },
      {
        jp: "すしがすきです。",
        romaji: "Sushi ga suki desu.",
        vn: "Tôi thích sushi.",
      },
      {
        jp: "メニューをおねがいします。",
        romaji: "Menyuu wo onegaishimasu.",
        vn: "Cho tôi xin thực đơn.",
      },
      {
        jp: "ラーメンをひとつください。",
        romaji: "Raamen wo hitotsu kudasai.",
        vn: "Cho tôi một bát mì ramen.",
      },
      {
        jp: "おかいけいをおねがいします。",
        romaji: "Okaikei wo onegaishimasu.",
        vn: "Làm ơn tính tiền giúp tôi.",
      },
    ],
  },
  "9": {
    topicId: 9,
    title: "Gia đình và con người",
    description:
      "Tiếng Nhật có 2 bộ từ gia đình riêng biệt: một bộ dùng khi nói về nhà mình, một bộ dùng khi nói về nhà người khác. Dùng nhầm bộ là lỗi lễ nghi khá nặng.",
    lessons: [
      {
        title: "Bài 1: Gia đình của tôi",
        desc: "Bộ từ KHIÊM NHƯỜNG, chỉ dùng khi nói về người nhà MÌNH với người ngoài. Người Nhật hạ thấp gia đình mình để đề cao người đối diện — nguyên tắc giao tiếp quan trọng nhất của xã hội Nhật.",
      },
      {
        title: "Bài 2: Gia đình của người khác",
        desc: "Bộ từ KÍNH TRỌNG, dùng khi hỏi hoặc nhắc tới người nhà của người khác. Dễ nhận ra vì luôn có お ở đầu và さん ở cuối: おとうさん, おかあさん. Đây cũng là cách trẻ con Nhật gọi bố mẹ mình.",
      },
      {
        title: "Bài 3: Người xung quanh",
        desc: "Từ vựng gọi người theo vai trò xã hội. Lưu ý ひと (người) là từ trung tính, còn かた là cách gọi lịch sự hơn, dùng khi nói về người trên hoặc khách.",
      },
      {
        title: "Bài 4: Gia đình bạn có mấy người?",
        desc: "Đếm người dùng đuôi にん, nhưng 1 người và 2 người bất quy tắc: ひとり, ふたり. Từ 3 người trở đi mới đều: さんにん, よにん, ごにん.",
      },
      {
        title: "Bài 5: Giới thiệu gia đình",
        desc: "Bài tổng hợp: ghép từ vựng gia đình với nghề nghiệp, tuổi tác và động từ います thành một đoạn giới thiệu hoàn chỉnh — đúng dạng câu hỏi thường gặp nhất trong kỳ thi nói JLPT và phỏng vấn.",
      },
    ],
    keyVocab: [
      {
        kana: "かぞく",
        romaji: "kazoku",
        vn: "gia đình",
        emoji: "👨‍👩‍👧‍👦",
      },
      {
        kana: "ちち",
        romaji: "chichi",
        vn: "bố tôi",
        emoji: "👨",
      },
      {
        kana: "はは",
        romaji: "haha",
        vn: "mẹ tôi",
        emoji: "👩",
      },
      {
        kana: "あに",
        romaji: "ani",
        vn: "anh trai tôi",
        emoji: "👦",
      },
      {
        kana: "あね",
        romaji: "ane",
        vn: "chị gái tôi",
        emoji: "👧",
      },
      {
        kana: "おとうと",
        romaji: "otouto",
        vn: "em trai tôi",
        emoji: "🧒",
      },
      {
        kana: "いもうと",
        romaji: "imouto",
        vn: "em gái tôi",
        emoji: "👶",
      },
      {
        kana: "おとうさん",
        romaji: "otousan",
        vn: "bố (của bạn)",
        emoji: "👨",
      },
      {
        kana: "おかあさん",
        romaji: "okaasan",
        vn: "mẹ (của bạn)",
        emoji: "👩",
      },
      {
        kana: "おにいさん",
        romaji: "oniisan",
        vn: "anh trai (của bạn)",
        emoji: "👦",
      },
    ],
    keySentences: [
      {
        jp: "ちちはかいしゃいんです。",
        romaji: "Chichi wa kaishain desu.",
        vn: "Bố tôi là nhân viên công ty.",
      },
      {
        jp: "いもうとはがくせいです。",
        romaji: "Imouto wa gakusei desu.",
        vn: "Em gái tôi là học sinh.",
      },
      {
        jp: "おとうさんはおいくつですか。",
        romaji: "Otousan wa oikutsu desu ka.",
        vn: "Bố bạn bao nhiêu tuổi ạ?",
      },
      {
        jp: "あのおんなのひとはせんせいです。",
        romaji: "Ano onna no hito wa sensei desu.",
        vn: "Người phụ nữ kia là cô giáo.",
      },
      {
        jp: "なんにんかぞくですか。",
        romaji: "Nannin kazoku desu ka.",
        vn: "Gia đình bạn có mấy người?",
      },
      {
        jp: "よにんかぞくです。",
        romaji: "Yonin kazoku desu.",
        vn: "Gia đình tôi có bốn người.",
      },
    ],
  },
  "10": {
    topicId: 10,
    title: "Tính từ và miêu tả",
    description:
      "Tiếng Nhật có 2 loại tính từ chia khác nhau hoàn toàn: tính từ đuôi い và tính từ đuôi な. Phân biệt được 2 loại này là bạn đã nắm gần trọn ngữ pháp N5.",
    lessons: [
      {
        title: "Bài 1: Tính từ đuôi い",
        desc: "Nhóm tính từ kết thúc bằng chữ い, đứng trực tiếp trước danh từ mà không cần thêm gì: たかいほん (quyển sách đắt). Đây là nhóm đông đảo nhất.",
      },
      {
        title: "Bài 2: Tính từ đuôi な",
        desc: "Nhóm này phải THÊM な khi đứng trước danh từ: きれいなはな (bông hoa đẹp), nhưng khi đứng cuối câu thì bỏ な: このはなはきれいです. Bẫy thường gặp: きれい và ゆうめい tuy kết thúc bằng い nhưng vẫn là tính từ な.",
      },
      {
        title: "Bài 3: Màu sắc",
        desc: "4 màu cơ bản あかい, あおい, しろい, くろい là tính từ đuôi い. Nhưng các màu còn lại như みどり, ちゃいろ lại là danh từ, phải thêm の khi bổ nghĩa: みどりのくるま (chiếc xe màu xanh lá).",
      },
      {
        title: "Bài 4: Thời tiết và bốn mùa",
        desc: "Nhật Bản có 4 mùa rõ rệt và người Nhật rất hay mở đầu câu chuyện bằng chuyện thời tiết — giống như người Việt hỏi ăn cơm chưa. きょうはあついですね là câu bắt chuyện an toàn nhất.",
      },
      {
        title: "Bài 5: Phủ định tính từ",
        desc: "2 loại tính từ phủ định khác nhau: tính từ い bỏ い thêm くない (たかい → たかくないです), tính từ な thì thêm じゃありません (しずか → しずかじゃありません). Ngoại lệ duy nhất: いい → よくないです.",
      },
      {
        title: "Bài 6: Nối hai tính từ",
        desc: "Muốn khen 2 điều cùng lúc: tính từ い đổi い thành くて (やすくて おいしい = rẻ mà ngon), tính từ な thì thêm で (しずかで きれい). Đây là mẫu câu ghi điểm trong phần thi nói vì cho thấy bạn diễn đạt được ý phức tạp.",
      },
    ],
    keyVocab: [
      {
        kana: "おおきい",
        romaji: "ookii",
        vn: "to, lớn",
        emoji: "🐘",
      },
      {
        kana: "ちいさい",
        romaji: "chiisai",
        vn: "nhỏ, bé",
        emoji: "🐜",
      },
      {
        kana: "たかい",
        romaji: "takai",
        vn: "cao, đắt",
        emoji: "🏔️",
      },
      {
        kana: "やすい",
        romaji: "yasui",
        vn: "rẻ",
        emoji: "🏷️",
      },
      {
        kana: "あたらしい",
        romaji: "atarashii",
        vn: "mới",
        emoji: "✨",
      },
      {
        kana: "ふるい",
        romaji: "furui",
        vn: "cũ",
        emoji: "🏚️",
      },
      {
        kana: "いい",
        romaji: "ii",
        vn: "tốt",
        emoji: "👍",
      },
      {
        kana: "むずかしい",
        romaji: "muzukashii",
        vn: "khó",
        emoji: "😣",
      },
      {
        kana: "きれい",
        romaji: "kirei",
        vn: "đẹp, sạch sẽ",
        emoji: "🌸",
      },
      {
        kana: "しずか",
        romaji: "shizuka",
        vn: "yên tĩnh",
        emoji: "🤫",
      },
    ],
    keySentences: [
      {
        jp: "このかばんはあたらしいです。",
        romaji: "Kono kaban wa atarashii desu.",
        vn: "Cái cặp này mới.",
      },
      {
        jp: "にほんごはむずかしいです。",
        romaji: "Nihongo wa muzukashii desu.",
        vn: "Tiếng Nhật thì khó.",
      },
      {
        jp: "このこうえんはしずかです。",
        romaji: "Kono kouen wa shizuka desu.",
        vn: "Công viên này yên tĩnh.",
      },
      {
        jp: "きれいなはなですね。",
        romaji: "Kirei na hana desu ne.",
        vn: "Bông hoa đẹp nhỉ.",
      },
      {
        jp: "あかいかさをかいます。",
        romaji: "Akai kasa wo kaimasu.",
        vn: "Tôi mua chiếc ô màu đỏ.",
      },
      {
        jp: "そのくるまはしろいです。",
        romaji: "Sono kuruma wa shiroi desu.",
        vn: "Chiếc xe đó màu trắng.",
      },
    ],
  },
  "11": {
    topicId: 11,
    title: "Mua sắm ở cửa hàng",
    description:
      "Chủ đề đưa bạn đi hết một lần mua sắm: biết tên các loại cửa hàng, gọi tên món đồ mình cần, hỏi giá, xin cỡ khác và trả tiền. Đây là tình huống người nước ngoài ở Nhật phải dùng tiếng Nhật nhiều nhất trong tuần đầu tiên.",
    lessons: [
      {
        title: "Bài 1: Các loại cửa hàng",
        desc: "Tiếng Nhật đặt tên cửa hàng cực kỳ dễ đoán: lấy tên món hàng rồi thêm や (ya) vào sau. ほん (sách) → ほんや (hiệu sách), にく (thịt) → にくや (hàng thịt), パン (bánh mì) → パンや (tiệm bánh). Biết mẹo này là tự đoán được tên hàng chục cửa hàng mà không cần học thuộc từng từ.",
      },
      {
        title: "Bài 2: Quần áo và đồ mặc",
        desc: "Phần lớn tên quần áo trong tiếng Nhật là từ mượn tiếng Anh viết bằng Katakana, đọc lên là đoán ra ngay: シャツ (shirt), コート (coat), スカート (skirt). Riêng ふく (quần áo nói chung), くつ (giày) và ぼうし (mũ) là từ thuần Nhật, phải nhớ riêng.",
      },
      {
        title: "Bài 3: Hỏi giá và trả tiền",
        desc: "いくらですか là câu bạn sẽ nói nhiều nhất khi mua sắm. Ở quầy thu ngân レジ, nhân viên hầu như luôn hỏi hai câu: có cần túi không (ふくろ) và trả bằng tiền mặt hay thẻ — げんきん hay カード, hai từ bạn đã học ở chủ đề nhà hàng.",
      },
      {
        title: "Bài 4: Chọn cỡ và màu",
        desc: "サイズ mượn thẳng từ size tiếng Anh. Muốn xin cỡ khác chỉ cần ghép tính từ đã học ở chủ đề miêu tả với サイズ: おおきいサイズ (cỡ lớn hơn), ちいさいサイズ (cỡ nhỏ hơn), rồi thêm はありますか (có … không ạ?).",
      },
      {
        title: "Bài 5: Giảm giá và khuyến mãi",
        desc: "Ở Nhật bảng giá dán chữ はんがく nghĩa là còn một nửa, còn むりょう là miễn phí — hai chữ đáng để nhận mặt sớm. セール thì mượn từ sale, thấy ở cửa kính mọi cửa hàng vào tháng 1 và tháng 7 hằng năm.",
      },
      {
        title: "Bài 6: Hội thoại mua hàng trọn vẹn",
        desc: "Ghép tất cả lại thành một lần mua hàng thật: xin xem đồ (みせてください), hỏi giá, chốt mua (これにします) hoặc từ chối lịch sự (けっこうです). けっこうです rất dễ hiểu nhầm — nó nghĩa là thôi, không cần đâu ạ, chứ không phải đồng ý.",
      },
    ],
    keyVocab: [
      {
        kana: "スーパー",
        romaji: "suupaa",
        vn: "siêu thị",
        emoji: "🛒",
      },
      {
        kana: "デパート",
        romaji: "depaato",
        vn: "trung tâm thương mại",
        emoji: "🏬",
      },
      {
        kana: "ほんや",
        romaji: "honya",
        vn: "hiệu sách",
        emoji: "📚",
      },
      {
        kana: "やおや",
        romaji: "yaoya",
        vn: "hàng rau quả",
        emoji: "🥬",
      },
      {
        kana: "にくや",
        romaji: "nikuya",
        vn: "hàng thịt",
        emoji: "🥩",
      },
      {
        kana: "パンや",
        romaji: "panya",
        vn: "tiệm bánh mì",
        emoji: "🥖",
      },
      {
        kana: "くすりや",
        romaji: "kusuriya",
        vn: "hiệu thuốc",
        emoji: "💊",
      },
      {
        kana: "ふく",
        romaji: "fuku",
        vn: "quần áo",
        emoji: "👕",
      },
      {
        kana: "シャツ",
        romaji: "shatsu",
        vn: "áo sơ mi",
        emoji: "👔",
      },
      {
        kana: "ズボン",
        romaji: "zubon",
        vn: "quần dài",
        emoji: "👖",
      },
    ],
    keySentences: [
      {
        jp: "スーパーでやさいをかいます。",
        romaji: "Suupaa de yasai o kaimasu.",
        vn: "Tôi mua rau ở siêu thị.",
      },
      {
        jp: "あしたデパートへいきます。",
        romaji: "Ashita depaato e ikimasu.",
        vn: "Ngày mai tôi đi trung tâm thương mại.",
      },
      {
        jp: "このシャツはやすいです。",
        romaji: "Kono shatsu wa yasui desu.",
        vn: "Chiếc áo sơ mi này rẻ.",
      },
      {
        jp: "あかいくつをかいました。",
        romaji: "Akai kutsu o kaimashita.",
        vn: "Tôi đã mua một đôi giày đỏ.",
      },
      {
        jp: "これはいくらですか。",
        romaji: "Kore wa ikura desu ka.",
        vn: "Cái này bao nhiêu tiền?",
      },
      {
        jp: "ふくろをおねがいします。",
        romaji: "Fukuro o onegaishimasu.",
        vn: "Cho tôi xin cái túi.",
      },
    ],
  },
  "12": {
    topicId: 12,
    title: "Đi lại và phương tiện",
    description:
      "Tàu điện là mạch máu của đời sống Nhật Bản. Chủ đề này dạy bạn gọi tên phương tiện, mua vé, tìm đúng lối ra, hỏi đường khi lạc và hỏi đi mất bao lâu — đủ để tự đi lại một mình mà không cần ai dẫn.",
    lessons: [
      {
        title: "Bài 1: Phương tiện đi lại",
        desc: "Nhóm từ này chia làm hai: từ thuần Nhật (でんしゃ tàu điện, くるま ô tô, じてんしゃ xe đạp, ひこうき máy bay) và từ mượn viết Katakana (バス, タクシー). しんかんせん là tàu siêu tốc — chữ này ghép từ 3 phần nghĩa đen là tuyến đường ray mới.",
      },
      {
        title: "Bài 2: Ở nhà ga",
        desc: "Ga tàu Nhật rất lớn, biết 4 chữ này là không lạc: きっぷ (vé), かいさつ (cửa soát vé), ホーム (sân ga, mượn từ platform), でぐち (lối ra). Bảng chỉ dẫn trong ga hầu như chỗ nào cũng có 4 chữ đó.",
      },
      {
        title: "Bài 3: Lên xe, xuống xe",
        desc: "Chú ý trợ từ: lên xe dùng に (でんしゃにのります), còn đi bằng phương tiện gì thì dùng で (でんしゃでいきます). Người Việt hay lẫn hai câu này. Riêng đi bộ thì không dùng で mà nói あるいて.",
      },
      {
        title: "Bài 4: Hỏi đường",
        desc: "Bạn đã biết まっすぐ và みぎにまがって ở chủ đề vị trí. Bài này thêm các mốc người Nhật hay lấy làm chuẩn khi chỉ đường: しんごう (đèn giao thông), こうさてん (ngã tư), かど (góc phố), はし (cây cầu).",
      },
      {
        title: "Bài 5: Đi mất bao lâu",
        desc: "Mẫu 〜から〜まで…かかります là cách chuẩn để nói quãng đường mất bao lâu: うちからえきまでじゅっぷんかかります = từ nhà đến ga mất 10 phút. どのくらい là câu hỏi tương ứng: khoảng bao lâu.",
      },
      {
        title: "Bài 6: Khi tàu trễ, tàu đông",
        desc: "Tàu Nhật hiếm khi trễ, nhưng khi trễ thì loa ga báo bằng chữ おくれて います. Giờ cao điểm sáng thì tàu こんでいます (đông nghẹt) — hai chữ này nghe được là bớt hoang mang hẳn.",
      },
    ],
    keyVocab: [
      {
        kana: "バス",
        romaji: "basu",
        vn: "xe buýt",
        emoji: "🚌",
      },
      {
        kana: "タクシー",
        romaji: "takushii",
        vn: "taxi",
        emoji: "🚕",
      },
      {
        kana: "じてんしゃ",
        romaji: "jitensha",
        vn: "xe đạp",
        emoji: "🚲",
      },
      {
        kana: "くるま",
        romaji: "kuruma",
        vn: "ô tô",
        emoji: "🚗",
      },
      {
        kana: "ひこうき",
        romaji: "hikouki",
        vn: "máy bay",
        emoji: "✈️",
      },
      {
        kana: "ちかてつ",
        romaji: "chikatetsu",
        vn: "tàu điện ngầm",
        emoji: "🚇",
      },
      {
        kana: "しんかんせん",
        romaji: "shinkansen",
        vn: "tàu siêu tốc",
        emoji: "🚄",
      },
      {
        kana: "きっぷ",
        romaji: "kippu",
        vn: "vé",
        emoji: "🎫",
      },
      {
        kana: "ホーム",
        romaji: "hoomu",
        vn: "sân ga",
        emoji: "🚉",
      },
      {
        kana: "でぐち",
        romaji: "deguchi",
        vn: "lối ra",
        emoji: "🚪",
      },
    ],
    keySentences: [
      {
        jp: "まいにちバスでがっこうへいきます。",
        romaji: "Mainichi basu de gakkou e ikimasu.",
        vn: "Hằng ngày tôi đi học bằng xe buýt.",
      },
      {
        jp: "ひこうきでベトナムへかえります。",
        romaji: "Hikouki de Betonamu e kaerimasu.",
        vn: "Tôi về Việt Nam bằng máy bay.",
      },
      {
        jp: "えきできっぷをかいます。",
        romaji: "Eki de kippu o kaimasu.",
        vn: "Tôi mua vé ở nhà ga.",
      },
      {
        jp: "でぐちはどこですか。",
        romaji: "Deguchi wa doko desu ka.",
        vn: "Lối ra ở đâu ạ?",
      },
      {
        jp: "えきでちかてつにのります。",
        romaji: "Eki de chikatetsu ni norimasu.",
        vn: "Tôi lên tàu điện ngầm ở ga.",
      },
      {
        jp: "つぎのえきでおります。",
        romaji: "Tsugi no eki de orimasu.",
        vn: "Tôi xuống ở ga tiếp theo.",
      },
    ],
  },
  "13": {
    topicId: 13,
    title: "Sở thích và ngày nghỉ",
    description:
      "Câu hỏi しゅみはなんですか (sở thích của bạn là gì?) gần như chắc chắn xuất hiện trong mọi cuộc làm quen với người Nhật. Chủ đề này cho bạn đủ vốn từ để trả lời, để nói thích hay không thích, giỏi hay kém, và kể mình làm gì vào cuối tuần.",
    lessons: [
      {
        title: "Bài 1: Sở thích của tôi",
        desc: "Mẫu câu しゅみは〜です dùng đúng một lần là dùng được cả đời: わたしのしゅみは りょうりです (sở thích của tôi là nấu ăn). Chỗ trống điền một danh từ chỉ hoạt động, không phải động từ.",
      },
      {
        title: "Bài 2: Thể thao",
        desc: "Tên môn thể thao đi với động từ します (chơi, làm): サッカーをします = chơi bóng đá. Đừng dịch chơi thành あそびます — あそびます chỉ dùng cho chơi đùa nói chung, không dùng cho môn thể thao.",
      },
      {
        title: "Bài 3: Phim ảnh và âm nhạc",
        desc: "Ba động từ đi kèm khác nhau, nhớ đúng cặp thì câu mới tự nhiên: えいがを みます (xem phim), おんがくをききます (nghe nhạc), うたをうたいます (hát bài hát). Cụm cuối lặp gốc từ うた nghe hơi lạ nhưng người Nhật nói đúng như vậy.",
      },
      {
        title: "Bài 4: Thích và không thích",
        desc: "Điểm dễ sai nhất: thứ được thích đi với が chứ không phải を — すしがすきです, không nói すしをすきです. Lý do là すき không phải động từ mà là tính từ な, nên câu có nghĩa đen gần với sushi thì đáng thích đối với tôi.",
      },
      {
        title: "Bài 5: Giỏi và kém",
        desc: "じょうず và へた cũng đi với が như すき. Một lưu ý về văn hoá: người Nhật gần như không tự khen mình じょうず — nói về bản thân thì họ dùng すき hoặc とくい, còn じょうず để dành khen người khác.",
      },
      {
        title: "Bài 6: Cuối tuần bạn làm gì",
        desc: "Bốn trạng từ tần suất này đặt ngay trước động từ: いつも (luôn luôn) > よく (thường xuyên) > ときどき (thỉnh thoảng) > ぜんぜん (hoàn toàn không). Riêng ぜんぜん bắt buộc đi với đuôi phủ định ở cuối câu.",
      },
    ],
    keyVocab: [
      {
        kana: "しゅみ",
        romaji: "shumi",
        vn: "sở thích",
        emoji: "🎯",
      },
      {
        kana: "りょこう",
        romaji: "ryokou",
        vn: "du lịch",
        emoji: "🧳",
      },
      {
        kana: "どくしょ",
        romaji: "dokusho",
        vn: "đọc sách",
        emoji: "📖",
      },
      {
        kana: "りょうり",
        romaji: "ryouri",
        vn: "nấu ăn",
        emoji: "🍳",
      },
      {
        kana: "しゃしん",
        romaji: "shashin",
        vn: "ảnh, chụp ảnh",
        emoji: "📷",
      },
      {
        kana: "かいもの",
        romaji: "kaimono",
        vn: "mua sắm",
        emoji: "🛍️",
      },
      {
        kana: "スポーツ",
        romaji: "supootsu",
        vn: "thể thao",
        emoji: "🏅",
      },
      {
        kana: "サッカー",
        romaji: "sakkaa",
        vn: "bóng đá",
        emoji: "⚽",
      },
      {
        kana: "やきゅう",
        romaji: "yakyuu",
        vn: "bóng chày",
        emoji: "⚾",
      },
      {
        kana: "テニス",
        romaji: "tenisu",
        vn: "quần vợt",
        emoji: "🎾",
      },
    ],
    keySentences: [
      {
        jp: "わたしのしゅみはりょうりです。",
        romaji: "Watashi no shumi wa ryouri desu.",
        vn: "Sở thích của tôi là nấu ăn.",
      },
      {
        jp: "にちようびにりょこうへいきます。",
        romaji: "Nichiyoubi ni ryokou e ikimasu.",
        vn: "Chủ nhật tôi đi du lịch.",
      },
      {
        jp: "まいあさジョギングをします。",
        romaji: "Maiasa jogingu o shimasu.",
        vn: "Sáng nào tôi cũng chạy bộ.",
      },
      {
        jp: "どようびにテニスをします。",
        romaji: "Doyoubi ni tenisu o shimasu.",
        vn: "Thứ bảy tôi chơi quần vợt.",
      },
      {
        jp: "よるえいがをみます。",
        romaji: "Yoru eiga o mimasu.",
        vn: "Buổi tối tôi xem phim.",
      },
      {
        jp: "うちでうたをうたいます。",
        romaji: "Uchi de uta o utaimasu.",
        vn: "Tôi hát ở nhà.",
      },
    ],
  },
  "14": {
    topicId: 14,
    title: "Sức khoẻ và cơ thể",
    description:
      "Chủ đề không ai muốn dùng nhưng lúc cần thì không thay thế được: gọi tên bộ phận cơ thể, nói đúng chỗ đang đau, mua thuốc và hiểu câu bác sĩ hỏi. Học trước lúc khoẻ để lúc ốm còn nói được.",
    lessons: [
      {
        title: "Bài 1: Các bộ phận cơ thể",
        desc: "Toàn từ ngắn một đến hai âm, rất dễ nhớ nhưng cũng rất dễ lẫn vì có nhiều từ đồng âm: め là mắt, みみ là tai, はな ở đây là mũi (trùng âm với はな hoa). Trong câu, ngữ cảnh sẽ cho biết đang nói đến nghĩa nào.",
      },
      {
        title: "Bài 2: Nói chỗ đang đau",
        desc: "Công thức đúng một mẫu duy nhất, thay tên bộ phận vào là xong: 〜がいたいです. あたまがいたいです = tôi đau đầu. Chú ý dùng が chứ không dùng は, vì phần đứng trước が chính là chỗ đang có vấn đề.",
      },
      {
        title: "Bài 3: Bệnh viện và thuốc",
        desc: "Ở Nhật thuốc kê đơn lấy tại くすりや ngay cạnh bệnh viện, còn thuốc thường mua ở siêu thị thuốc. Động từ đi với thuốc là のみます (uống) — kể cả thuốc viên hay thuốc bột đều dùng のみます.",
      },
      {
        title: "Bài 4: Cảm giác trong người",
        desc: "つかれました đã ở thể quá khứ sẵn — người Nhật nói tôi đã mệt chứ không nói tôi đang mệt, vì mệt là kết quả của việc vừa làm xong. Đây là câu bạn sẽ nghe đồng nghiệp nói mỗi chiều tan làm.",
      },
      {
        title: "Bài 5: Lời khuyên và lời chúc",
        desc: "おだいじに là câu chia tay chuẩn mực khi người kia đang ốm, dịch thoáng là giữ gìn sức khoẻ nhé. Nói câu này lúc bạn bè hay đồng nghiệp Nhật xin nghỉ ốm sẽ được đánh giá là rất tinh ý.",
      },
      {
        title: "Bài 6: Ở phòng khám",
        desc: "Bác sĩ Nhật gần như luôn mở đầu bằng どうしましたか (bạn bị làm sao?) rồi hỏi いつからですか (từ khi nào?). Chỉ cần trả lời được hai câu đó là buổi khám trôi qua được, phần còn lại bác sĩ sẽ dẫn.",
      },
    ],
    keyVocab: [
      {
        kana: "め",
        romaji: "me",
        vn: "mắt",
        emoji: "👁️",
      },
      {
        kana: "はな",
        romaji: "hana",
        vn: "mũi",
        emoji: "👃",
      },
      {
        kana: "くち",
        romaji: "kuchi",
        vn: "miệng",
        emoji: "👄",
      },
      {
        kana: "みみ",
        romaji: "mimi",
        vn: "tai",
        emoji: "👂",
      },
      {
        kana: "て",
        romaji: "te",
        vn: "tay",
        emoji: "✋",
      },
      {
        kana: "あし",
        romaji: "ashi",
        vn: "chân",
        emoji: "🦵",
      },
      {
        kana: "あたま",
        romaji: "atama",
        vn: "đầu",
        emoji: "🤕",
      },
      {
        kana: "おなか",
        romaji: "onaka",
        vn: "bụng",
        emoji: "🤰",
      },
      {
        kana: "いたい",
        romaji: "itai",
        vn: "đau",
        emoji: "😣",
      },
      {
        kana: "ねつ",
        romaji: "netsu",
        vn: "sốt",
        emoji: "🤒",
      },
    ],
    keySentences: [
      {
        jp: "こどもはめがおおきいです。",
        romaji: "Kodomo wa me ga ookii desu.",
        vn: "Đứa bé có đôi mắt to.",
      },
      {
        jp: "おとうさんはあしがながいです。",
        romaji: "Otousan wa ashi ga nagai desu.",
        vn: "Bố tôi chân dài.",
      },
      {
        jp: "あたまがいたいです。",
        romaji: "Atama ga itai desu.",
        vn: "Tôi bị đau đầu.",
      },
      {
        jp: "きょうはねつがあります。",
        romaji: "Kyou wa netsu ga arimasu.",
        vn: "Hôm nay tôi bị sốt.",
      },
      {
        jp: "びょういんへいきます。",
        romaji: "Byouin e ikimasu.",
        vn: "Tôi đi bệnh viện.",
      },
      {
        jp: "あさくすりをのみます。",
        romaji: "Asa kusuri o nomimasu.",
        vn: "Buổi sáng tôi uống thuốc.",
      },
    ],
  },
};

export function getTopicGuide(topicId: number): TopicGuide | undefined {
  return TOPIC_GUIDES[topicId];
}
