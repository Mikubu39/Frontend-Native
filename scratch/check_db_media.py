import subprocess
import os

uploads_root = r"c:\Users\Endministrator\Documents\BE_NihongoApp\uploads"

def run_query(sql):
    cmd = [
        "docker", "exec", "be_nihongoapp-db-1", 
        "mysql", "--default-character-set=utf8mb4", 
        "-uroot", "-prootchangeme", "nihongo_db", 
        "-N", "-e", sql
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        print("SQL Error:", res.stderr)
        return []
    lines = [line.strip() for line in res.stdout.strip().split("\n") if line.strip()]
    return lines

print("=== Checking lesson_questions audio_url ===")
q_audios = run_query("SELECT DISTINCT audio_url FROM lesson_questions WHERE audio_url IS NOT NULL AND audio_url != '';")
missing_q_audios = []
for url in q_audios:
    # url starts with /uploads/
    rel = url.replace("/uploads/", "").replace("/", "\\")
    full_path = os.path.join(uploads_root, rel)
    if not os.path.exists(full_path):
        missing_q_audios.append((url, full_path))

print(f"Total q audios: {len(q_audios)}, Missing on disk: {len(missing_q_audios)}")
for m in missing_q_audios[:10]:
    print("  Missing audio:", m[0])

print("\n=== Checking lesson_questions image_url ===")
q_images = run_query("SELECT DISTINCT image_url FROM lesson_questions WHERE image_url IS NOT NULL AND image_url != '';")
missing_q_images = []
for url in q_images:
    rel = url.replace("/uploads/", "").replace("/", "\\")
    full_path = os.path.join(uploads_root, rel)
    if not os.path.exists(full_path):
        missing_q_images.append((url, full_path))

print(f"Total q images: {len(q_images)}, Missing on disk: {len(missing_q_images)}")
for m in missing_q_images[:10]:
    print("  Missing image:", m[0])

print("\n=== Checking lesson_question_options image_url ===")
opt_images = run_query("SELECT DISTINCT image_url FROM lesson_question_options WHERE image_url IS NOT NULL AND image_url != '';")
missing_opt_images = []
for url in opt_images:
    rel = url.replace("/uploads/", "").replace("/", "\\")
    full_path = os.path.join(uploads_root, rel)
    if not os.path.exists(full_path):
        missing_opt_images.append((url, full_path))

print(f"Total opt images: {len(opt_images)}, Missing on disk: {len(missing_opt_images)}")
for m in missing_opt_images[:10]:
    print("  Missing opt image:", m[0])

print("\n=== Checking lesson_question_options audio_url ===")
opt_audios = run_query("SELECT DISTINCT audio_url FROM lesson_question_options WHERE audio_url IS NOT NULL AND audio_url != '';")
missing_opt_audios = []
for url in opt_audios:
    rel = url.replace("/uploads/", "").replace("/", "\\")
    full_path = os.path.join(uploads_root, rel)
    if not os.path.exists(full_path):
        missing_opt_audios.append((url, full_path))

print(f"Total opt audios: {len(opt_audios)}, Missing on disk: {len(missing_opt_audios)}")
for m in missing_opt_audios[:10]:
    print("  Missing opt audio:", m[0])

print("\n=== Checking shop_items icon_url ===")
shop_icons = run_query("SELECT DISTINCT icon_url FROM shop_items WHERE icon_url IS NOT NULL AND icon_url != '';")
missing_shop_icons = []
for url in shop_icons:
    rel = url.replace("/uploads/", "").replace("/", "\\")
    full_path = os.path.join(uploads_root, rel)
    if not os.path.exists(full_path):
        missing_shop_icons.append((url, full_path))

print(f"Total shop icons: {len(shop_icons)}, Missing on disk: {len(missing_shop_icons)}")
for m in missing_shop_icons[:10]:
    print("  Missing shop icon:", m[0])
