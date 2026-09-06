import subprocess
import os
import json

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

# 1. Inspect missing audios
q_audios = run_query("SELECT DISTINCT audio_url, metadata_json, question_text FROM lesson_questions WHERE audio_url IS NOT NULL AND audio_url != '';")
missing_audios = {}
for line in q_audios:
    parts = line.split("\t")
    if len(parts) >= 1:
        url = parts[0]
        rel = url.replace("/uploads/", "").replace("/", "\\")
        full_path = os.path.join(uploads_root, rel)
        if not os.path.exists(full_path):
            meta = {}
            if len(parts) >= 2 and parts[1] != "NULL":
                try:
                    meta = json.loads(parts[1])
                except:
                    pass
            qtext = parts[2] if len(parts) >= 3 else ""
            missing_audios[url] = {
                "meta": meta,
                "qtext": qtext
            }

print(f"Missing audios from lesson_questions: {len(missing_audios)}")
for url, data in list(missing_audios.items())[:5]:
    print(f"  {url}: meta={data['meta']}, qtext={data['qtext']}")

# 2. Inspect missing images
opt_images = run_query("SELECT DISTINCT o.image_url, o.option_text, o.metadata_json FROM lesson_question_options o WHERE o.image_url IS NOT NULL AND o.image_url != '';")
missing_images = {}
for line in opt_images:
    parts = line.split("\t")
    if len(parts) >= 1:
        url = parts[0]
        rel = url.replace("/uploads/", "").replace("/", "\\")
        full_path = os.path.join(uploads_root, rel)
        if not os.path.exists(full_path):
            meta = {}
            if len(parts) >= 3 and parts[2] != "NULL":
                try:
                    meta = json.loads(parts[2])
                except:
                    pass
            otext = parts[1] if len(parts) >= 2 else ""
            missing_images[url] = {
                "otext": otext,
                "meta": meta
            }

print(f"Missing images from options: {len(missing_images)}")
for url, data in list(missing_images.items())[:5]:
    print(f"  {url}: otext={data['otext']}, meta={data['meta']}")
