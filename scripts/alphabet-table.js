/**
 * Bảng chữ cái Hiragana / Katakana đầy đủ (gojūon + dakuten/handakuten + yōon).
 *
 * Mỗi hàng viết gọn dạng `"hiragana/katakana romaji"`, ngăn cách bằng " | ".
 * Sửa dữ liệu ở đây rồi chạy lại `npm run seed:alphabets`.
 */

/** Gojūon - 46 chữ cơ bản. */
const GOJUON = [
  ["A", "あ/ア a | い/イ i | う/ウ u | え/エ e | お/オ o"],
  ["K", "か/カ ka | き/キ ki | く/ク ku | け/ケ ke | こ/コ ko"],
  ["S", "さ/サ sa | し/シ shi | す/ス su | せ/セ se | そ/ソ so"],
  ["T", "た/タ ta | ち/チ chi | つ/ツ tsu | て/テ te | と/ト to"],
  ["N", "な/ナ na | に/ニ ni | ぬ/ヌ nu | ね/ネ ne | の/ノ no"],
  ["H", "は/ハ ha | ひ/ヒ hi | ふ/フ fu | へ/ヘ he | ほ/ホ ho"],
  ["M", "ま/マ ma | み/ミ mi | む/ム mu | め/メ me | も/モ mo"],
  ["Y", "や/ヤ ya | ゆ/ユ yu | よ/ヨ yo"],
  ["R", "ら/ラ ra | り/リ ri | る/ル ru | れ/レ re | ろ/ロ ro"],
  ["W", "わ/ワ wa | を/ヲ wo | ん/ン n"],
];

/** Dakuten (゛) và handakuten (゜) - 25 chữ biến âm. */
const DAKUTEN = [
  ["G", "が/ガ ga | ぎ/ギ gi | ぐ/グ gu | げ/ゲ ge | ご/ゴ go"],
  ["Z", "ざ/ザ za | じ/ジ ji | ず/ズ zu | ぜ/ゼ ze | ぞ/ゾ zo"],
  ["D", "だ/ダ da | ぢ/ヂ ji | づ/ヅ zu | で/デ de | ど/ド do"],
  ["B", "ば/バ ba | び/ビ bi | ぶ/ブ bu | べ/ベ be | ぼ/ボ bo"],
  ["P", "ぱ/パ pa | ぴ/ピ pi | ぷ/プ pu | ぺ/ペ pe | ぽ/ポ po"],
];

/** Yōon - 33 âm ghép (2 ký tự; KanjiVG không có nét cho tổ hợp). */
const YOON = [
  ["K", "きゃ/キャ kya | きゅ/キュ kyu | きょ/キョ kyo"],
  ["S", "しゃ/シャ sha | しゅ/シュ shu | しょ/ショ sho"],
  ["T", "ちゃ/チャ cha | ちゅ/チュ chu | ちょ/チョ cho"],
  ["N", "にゃ/ニャ nya | にゅ/ニュ nyu | にょ/ニョ nyo"],
  ["H", "ひゃ/ヒャ hya | ひゅ/ヒュ hyu | ひょ/ヒョ hyo"],
  ["M", "みゃ/ミャ mya | みゅ/ミュ myu | みょ/ミョ myo"],
  ["R", "りゃ/リャ rya | りゅ/リュ ryu | りょ/リョ ryo"],
  ["G", "ぎゃ/ギャ gya | ぎゅ/ギュ gyu | ぎょ/ギョ gyo"],
  ["J", "じゃ/ジャ ja | じゅ/ジュ ju | じょ/ジョ jo"],
  ["B", "びゃ/ビャ bya | びゅ/ビュ byu | びょ/ビョ byo"],
  ["P", "ぴゃ/ピャ pya | ぴゅ/ピュ pyu | ぴょ/ピョ pyo"],
];

/** "あ/ア a | い/イ i" -> [{ hiragana, katakana, romaji }, ...] */
function parseRow(row) {
  return row.split("|").map((entry) => {
    const [symbols, romaji] = entry.trim().split(/\s+/);
    const [hiragana, katakana] = symbols.split("/");
    return { hiragana, katakana, romaji };
  });
}

/**
 * Danh sách phẳng cho một `type`, kèm groupName tiếng Việt và orderIndex 1..n.
 */
function buildCharacters(type, { includeYoon = true } = {}) {
  const isHiragana = type === "HIRAGANA";
  const characters = [];

  const push = (sections, label) => {
    for (const [group, row] of sections) {
      for (const entry of parseRow(row)) {
        characters.push({
          symbol: isHiragana ? entry.hiragana : entry.katakana,
          romaji: entry.romaji,
          type,
          groupName: `${label} ${group}`,
          orderIndex: characters.length + 1,
        });
      }
    }
  };

  push(GOJUON, "Hàng");
  push(DAKUTEN, "Hàng");
  if (includeYoon) push(YOON, "Âm ghép");

  return characters;
}

module.exports = { GOJUON, DAKUTEN, YOON, buildCharacters };
