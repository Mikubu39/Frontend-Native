import sys
import os
import json

sys.path.append(r"c:\Users\Endministrator\Documents\BE_NihongoApp\test-data\demo-seed")
import data_topics_a
import data_topics_b
import data_topics_c

all_topics = data_topics_a.TOPICS_A + data_topics_b.TOPICS_B + data_topics_c.TOPICS_C
print(f"Loaded {len(all_topics)} topics.")

guides = []
for idx, t in enumerate(all_topics):
    topic_id = idx + 1
    title = t.get("title", "")
    desc = t.get("desc", "")
    
    # Collect key vocab (top 8) and key sentences (top 5) across lessons
    key_vocab = []
    seen_vocab = set()
    key_sentences = []
    seen_sentences = set()
    lesson_summaries = []
    
    for l in t.get("lessons", []):
        ltitle = l.get("title", "")
        ldesc = l.get("desc", "")
        if ltitle:
            lesson_summaries.append({
                "title": ltitle,
                "desc": ldesc
            })
        for v in l.get("vocab", []):
            kana = v.get("kana", "")
            if kana and kana not in seen_vocab:
                seen_vocab.add(kana)
                key_vocab.append({
                    "kana": kana,
                    "romaji": v.get("romaji", ""),
                    "vn": v.get("vn", ""),
                    "emoji": v.get("emoji", "")
                })
        for s in l.get("sentences", []):
            jp = s.get("jp", "")
            if jp and jp not in seen_sentences:
                seen_sentences.add(jp)
                key_sentences.append({
                    "jp": jp,
                    "romaji": s.get("romaji", ""),
                    "vn": s.get("vn", "")
                })
                
    guides.append({
        "topicId": topic_id,
        "title": title,
        "description": desc,
        "lessons": lesson_summaries,
        "keyVocab": key_vocab[:10],
        "keySentences": key_sentences[:6]
    })

ts_content = f"""/**
 * Sổ tay Hướng dẫn Chủ đề (Unit Guidebooks) chuẩn Duolingo.
 * Tóm tắt ngữ pháp, bài học, từ vựng và câu then chốt cho 14 chủ đề.
 */

export interface GuideVocab {{
  kana: string;
  romaji: string;
  vn: string;
  emoji?: string;
}}

export interface GuideSentence {{
  jp: string;
  romaji: string;
  vn: string;
}}

export interface GuideLessonSummary {{
  title: string;
  desc: string;
}}

export interface TopicGuide {{
  topicId: number;
  title: string;
  description: string;
  lessons: GuideLessonSummary[];
  keyVocab: GuideVocab[];
  keySentences: GuideSentence[];
}}

export const TOPIC_GUIDES: Record<number, TopicGuide> = {json.dumps({g["topicId"]: g for g in guides}, ensure_ascii=False, indent=2)};

export function getTopicGuide(topicId: number): TopicGuide | undefined {{
  return TOPIC_GUIDES[topicId];
}}
"""

out_path = r"c:\Users\Endministrator\Pictures\Frontend-Native\src\data\topic-guides.ts"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Generated {out_path} with {len(guides)} topic guides!")
