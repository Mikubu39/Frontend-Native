const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UPLOADS_DIR = 'C:/Users/Endministrator/Documents/BE_NihongoApp/uploads';

function getAllFiles(dir, arr = []) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) getAllFiles(fp, arr);
    else arr.push(('/uploads/' + path.relative(UPLOADS_DIR, fp).replace(/\\/g, '/')).toLowerCase());
  });
  return arr;
}
const files = new Set(getAllFiles(path.join(UPLOADS_DIR, 'audios')));

const res = execSync(`docker exec be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db --default-character-set=utf8mb4 -N -e "SELECT id, JSON_UNQUOTE(JSON_EXTRACT(metadata_json, '$.romaji')) FROM lesson_questions WHERE question_type = 'TRANSLATE_TO_VN' AND audio_url IS NULL;"`, { encoding: 'utf-8' });

let matchCount = 0;
const updates = [];
res.trim().split('\n').filter(Boolean).forEach(line => {
  const [id, romaji] = line.split('\t');
  if (!romaji || romaji === 'NULL') return;
  const clean = romaji.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s_]+/g, '-');
  const candidate = '/uploads/audios/words/' + clean + '.mp3';
  if (files.has(candidate)) {
    matchCount++;
    updates.push(`UPDATE lesson_questions SET audio_url = '${candidate}' WHERE id = ${id};`);
  } else {
    // Check without dashes or with space
    console.log('Unmatched:', id, romaji, candidate);
  }
});
console.log('Matched:', matchCount, 'out of remaining');
if (updates.length > 0) {
  fs.writeFileSync('scratch_lq.sql', updates.join('\n'), 'utf-8');
  execSync('docker exec -i be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db < scratch_lq.sql', { shell: 'cmd.exe' });
  fs.unlinkSync('scratch_lq.sql');
  console.log('Updated', updates.length, 'questions in DB!');
}
