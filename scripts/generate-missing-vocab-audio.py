# -*- coding: utf-8 -*-
"""
Script generate-missing-vocab-audio.py
Sinh file MP3 phát âm bằng edge-tts (ja-JP-NanamiNeural, rate=-10%) cho 77 từ vựng
trong bảng vocabulary hiện đang có audio_url IS NULL, sau đó cập nhật MySQL.
"""
import asyncio
import os
import re
import subprocess
import sys
import edge_tts

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

WORDS_DIR = os.path.abspath("C:/Users/Endministrator/Documents/BE_NihongoApp/uploads/audios/words")
os.makedirs(WORDS_DIR, exist_ok=True)

# Lấy 77 từ vựng từ MySQL
cmd = [
    "docker", "exec", "be_nihongoapp-db-1", "mysql",
    "-u", "nihongo_user", "-p1234", "nihongo_db",
    "--default-character-set=utf8mb4",
    "-N", "-e",
    "SELECT id, surface, romaji, meaning_vn FROM vocabulary WHERE audio_url IS NULL;"
]

print("1. Đang truy vấn từ vựng chưa có audio từ MySQL...")
proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
if proc.returncode != 0:
    print("Lỗi truy vấn MySQL:", proc.stderr)
    sys.exit(1)

lines = proc.stdout.strip().split("\n")
rows = [line.split("\t") for line in lines if line.strip()]
print(f"Tìm thấy {len(rows)} từ vựng cần sinh âm thanh.")

# Chuẩn hoá tên file và văn bản đọc
items = []
used_filenames = set()

for r in rows:
    vid, surface, romaji, meaning = r[0], r[1], r[2] if len(r) > 2 else "", r[3] if len(r) > 3 else ""
    
    # Text đọc bằng TTS
    speak_text = surface.strip()
    if surface == "〜さん" or surface == "-san":
        speak_text = "さん"
    elif surface == "〜さい" or surface == "-sai":
        speak_text = "さい"
    elif surface == "は" and "wa" in romaji.lower():
        speak_text = "わ"  # Trợ từ chủ đề wa
    elif surface == "リン":
        speak_text = "リン"

    # Tên file từ romaji
    clean_romaji = re.sub(r"[^\w\s-]", "", romaji.lower()).strip()
    clean_romaji = re.sub(r"[\s_]+", "-", clean_romaji)
    clean_romaji = re.sub(r"-+", "-", clean_romaji).strip("-")
    if not clean_romaji:
        clean_romaji = f"vocab-{vid}"
    
    filename = f"{clean_romaji}.mp3"
    # Tránh trùng tên file giữa các từ khác nhau
    if filename in used_filenames:
        filename = f"{clean_romaji}-{vid}.mp3"
    used_filenames.add(filename)

    filepath = os.path.join(WORDS_DIR, filename)
    audio_url = f"/uploads/audios/words/{filename}"

    items.append({
        "id": vid,
        "surface": surface,
        "romaji": romaji,
        "speak_text": speak_text,
        "filepath": filepath,
        "audio_url": audio_url,
        "filename": filename
    })

print(f"2. Đang sinh {len(items)} file MP3 bằng edge-tts...")

async def generate_all(items):
    sem = asyncio.Semaphore(5)
    success = []
    failed = []

    async def gen_one(it):
        async with sem:
            for attempt in range(3):
                try:
                    c = edge_tts.Communicate(
                        text=it["speak_text"],
                        voice="ja-JP-NanamiNeural",
                        rate="-10%"
                    )
                    await c.save(it["filepath"])
                    if os.path.exists(it["filepath"]) and os.path.getsize(it["filepath"]) > 300:
                        success.append(it)
                        return
                except Exception as e:
                    if attempt == 2:
                        failed.append((it, str(e)))
                    await asyncio.sleep(1.5 * (attempt + 1))

    await asyncio.gather(*[gen_one(it) for it in items])
    return success, failed

success, failed = asyncio.run(generate_all(items))
print(f"-> Tạo thành công: {len(success)} file.")
if failed:
    print(f"-> Thất bại: {len(failed)} file:")
    for it, err in failed:
        print(f"   {it['id']}: {it['surface']} ({it['speak_text']}) - {err}")
    sys.exit(1)

print("3. Đang cập nhật audio_url vào cơ sở dữ liệu MySQL...")
sql_statements = []
for it in success:
    sql_statements.append(f"UPDATE vocabulary SET audio_url = '{it['audio_url']}' WHERE id = {it['id']};")

batch_sql = "\n".join(sql_statements)
sql_file = os.path.abspath("scratch_update_vocab.sql")
with open(sql_file, "w", encoding="utf-8") as f:
    f.write(batch_sql)

try:
    update_cmd = f'docker exec -i be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db --default-character-set=utf8mb4 < "{sql_file}"'
    res = subprocess.run(update_cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
    if res.returncode == 0:
        print("-> Cập nhật 77 từ vựng trong MySQL thành công!")
    else:
        print("Lỗi cập nhật MySQL:", res.stderr)
finally:
    if os.path.exists(sql_file):
        os.remove(sql_file)

print("=== HOÀN TẤT BƯỚC 1 & 2 ===")
