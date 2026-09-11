/**
 * Script backfill audio_url cho bảng vocabulary trong cơ sở dữ liệu.
 * Quét thư mục uploads/audios/words và cập nhật audio_url cho các từ có romaji khớp với file mp3.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WORDS_DIR = path.resolve(
  __dirname,
  "../../../Documents/BE_NihongoApp/uploads/audios/words",
);

if (!fs.existsSync(WORDS_DIR)) {
  console.error("Không tìm thấy thư mục âm thanh:", WORDS_DIR);
  process.exit(1);
}

const existingFiles = new Set(
  fs.readdirSync(WORDS_DIR).map((f) => f.toLowerCase()),
);

console.log(`Tìm thấy ${existingFiles.size} file MP3 trong thư mục words.`);

// Lấy danh sách vocabulary từ MySQL
const queryCmd =
  'docker exec be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db -N -e "SELECT id, surface, romaji FROM vocabulary WHERE audio_url IS NULL;"';

let output = "";
try {
  output = execSync(queryCmd, { encoding: "utf-8" });
} catch (err) {
  console.error("Lỗi khi kết nối MySQL container:", err.message);
  process.exit(1);
}

const lines = output.trim().split("\n");
let matchCount = 0;
const updateStatements = [];

for (const line of lines) {
  if (!line.trim()) continue;
  const parts = line.split("\t");
  const id = parts[0];
  const surface = parts[1];
  const romaji = (parts[2] || "").trim();
  if (!romaji) continue;

  const cleanRomaji = romaji
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const filename = `${cleanRomaji}.mp3`;

  if (existingFiles.has(filename)) {
    matchCount++;
    const audioUrl = `/uploads/audios/words/${filename}`;
    updateStatements.push(
      `UPDATE vocabulary SET audio_url = '${audioUrl}' WHERE id = ${id};`,
    );
  }
}

console.log(`Có ${matchCount} từ vựng khớp với file MP3.`);

if (updateStatements.length > 0) {
  const batchSql = updateStatements.join(" ");
  // Ghi tạm file sql vào scratch hoặc thực thi theo khối
  const sqlFile = path.resolve(__dirname, "../scratch_update_audio.sql");
  fs.writeFileSync(sqlFile, batchSql, "utf-8");

  try {
    execSync(
      `docker exec -i be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db < "${sqlFile}"`,
      { shell: "cmd.exe" },
    );
    console.log("Cập nhật audio_url vào database thành công!");
  } catch (err) {
    console.error("Lỗi khi chạy SQL update:", err.message);
  } finally {
    if (fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
  }
} else {
  console.log("Không có câu lệnh SQL nào cần chạy.");
}
