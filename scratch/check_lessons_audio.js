const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UPLOADS_DIR = 'C:/Users/Endministrator/Documents/BE_NihongoApp/uploads';

function getAllFiles(dirPath, arr = []) {
  fs.readdirSync(dirPath).forEach(f => {
    const fp = path.join(dirPath, f);
    if (fs.statSync(fp).isDirectory()) getAllFiles(fp, arr);
    else arr.push(('/uploads/' + path.relative(UPLOADS_DIR, fp).replace(/\\/g, '/')).toLowerCase());
  });
  return arr;
}

const files = new Set(getAllFiles(path.join(UPLOADS_DIR, 'audios')));
console.log(`Loaded ${files.size} audio files from disk.`);

// 1. Check teachAudio in lesson_questions
const res = execSync(`docker exec be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db -N -e "SELECT id, lesson_id, question_type, JSON_UNQUOTE(JSON_EXTRACT(metadata_json, '$.teachAudio')) FROM lesson_questions WHERE metadata_json IS NOT NULL;"`, { encoding: 'utf-8' });

let totalTeachAudio = 0;
let brokenTeachAudio = [];
res.trim().split('\n').filter(Boolean).forEach(line => {
  const [id, lessonId, type, teachAudio] = line.split('\t');
  if (teachAudio && teachAudio !== 'NULL' && teachAudio !== 'null') {
    totalTeachAudio++;
    const clean = teachAudio.trim().toLowerCase();
    if (!files.has(clean)) {
      brokenTeachAudio.push({ id, lessonId, type, teachAudio });
    }
  }
});

console.log(`Total teachAudio in lesson_questions: ${totalTeachAudio}`);
console.log(`Broken teachAudio count: ${brokenTeachAudio.length}`);
if (brokenTeachAudio.length > 0) {
  console.log('Sample broken teachAudio:', brokenTeachAudio.slice(0, 10));
}

// 2. Check all lessons to see if ANY lesson has 0 audio
const lessonsWithAudioRes = execSync(`docker exec be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db -N -e "SELECT l.id, l.title, l.lesson_type, COUNT(q.id) as total_questions, SUM(CASE WHEN q.audio_url IS NOT NULL OR JSON_UNQUOTE(JSON_EXTRACT(q.metadata_json, '$.teachAudio')) IS NOT NULL THEN 1 ELSE 0 END) as questions_with_audio FROM lessons l LEFT JOIN lesson_questions q ON l.id = q.lesson_id GROUP BY l.id, l.title, l.lesson_type;"`, { encoding: 'utf-8' });

const lessonRows = lessonsWithAudioRes.trim().split('\n').filter(Boolean);
let lessonsWithoutAnyAudio = [];
lessonRows.forEach(row => {
  const [id, title, type, totalQ, withAudio] = row.split('\t');
  if (parseInt(totalQ, 10) > 0 && parseInt(withAudio, 10) === 0) {
    lessonsWithoutAnyAudio.push({ id, title, type, totalQ, withAudio });
  }
});

console.log(`Total lessons: ${lessonRows.length}`);
console.log(`Lessons with questions but 0 audio: ${lessonsWithoutAnyAudio.length}`);
if (lessonsWithoutAnyAudio.length > 0) {
  console.log('Lessons without any audio:', lessonsWithoutAnyAudio);
}
