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

# Get all questions with audio
q_rows = run_query("SELECT id, lesson_id, question_type, audio_url, image_url FROM lesson_questions;")
broken_q_audio = []
broken_q_img = []

for row in q_rows:
    parts = row.split("\t")
    if len(parts) < 5:
        continue
    qid, lid, qtype, aurl, iurl = parts[0], parts[1], parts[2], parts[3], parts[4]
    if aurl and aurl != "NULL":
        rel = aurl.replace("/uploads/", "").replace("/", "\\")
        if not os.path.exists(os.path.join(uploads_root, rel)):
            broken_q_audio.append((qid, lid, qtype, aurl))
    if iurl and iurl != "NULL":
        rel = iurl.replace("/uploads/", "").replace("/", "\\")
        if not os.path.exists(os.path.join(uploads_root, rel)):
            broken_q_img.append((qid, lid, qtype, iurl))

print(f"Total questions with broken audio_url: {len(broken_q_audio)}")
print(f"Total questions with broken image_url: {len(broken_q_img)}")

# Get all options with image
opt_rows = run_query("SELECT o.id, o.question_id, q.question_type, o.image_url, o.audio_url FROM lesson_question_options o JOIN lesson_questions q ON o.question_id = q.id;")
broken_opt_img = []
broken_opt_audio = []

for row in opt_rows:
    parts = row.split("\t")
    if len(parts) < 5:
        continue
    oid, qid, qtype, iurl, aurl = parts[0], parts[1], parts[2], parts[3], parts[4]
    if iurl and iurl != "NULL":
        rel = iurl.replace("/uploads/", "").replace("/", "\\")
        if not os.path.exists(os.path.join(uploads_root, rel)):
            broken_opt_img.append((oid, qid, qtype, iurl))
    if aurl and aurl != "NULL":
        rel = aurl.replace("/uploads/", "").replace("/", "\\")
        if not os.path.exists(os.path.join(uploads_root, rel)):
            broken_opt_audio.append((oid, qid, qtype, aurl))

print(f"Total options with broken image_url: {len(broken_opt_img)}")
print(f"Total options with broken audio_url: {len(broken_opt_audio)}")

# Check question types affected
from collections import Counter
print("Broken Q audio by type:", Counter([x[2] for x in broken_q_audio]))
print("Broken Q img by type:", Counter([x[2] for x in broken_q_img]))
print("Broken Opt img by type:", Counter([x[2] for x in broken_opt_img]))
