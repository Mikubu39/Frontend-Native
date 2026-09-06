import json
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

media_json_path = r"c:\Users\Endministrator\Documents\BE_NihongoApp\test-data\demo-seed\out\media.json"
uploads_root = r"c:\Users\Endministrator\Documents\BE_NihongoApp\uploads"

with open(media_json_path, "r", encoding="utf-8") as f:
    media = json.load(f)

img_items = media.get("image", [])
audio_items = media.get("audio", [])

print(f"media.json contains: {len(img_items)} images, {len(audio_items)} audios")

missing_imgs = []
for it in img_items:
    rel = it["rel"].replace("/", os.sep)
    path = os.path.join(uploads_root, "images", rel)
    if not os.path.exists(path):
        missing_imgs.append((it, path))

missing_audios = []
for it in audio_items:
    rel = it["rel"].replace("/", os.sep)
    path = os.path.join(uploads_root, "audios", rel)
    if not os.path.exists(path) or os.path.getsize(path) < 1000:
        missing_audios.append((it, path))

print(f"Missing from media.json: {len(missing_imgs)} images, {len(missing_audios)} audios")
