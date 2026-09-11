const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UPLOADS_DIR = 'C:/Users/Endministrator/Documents/BE_NihongoApp/uploads';
const AUDIOS_DIR = path.join(UPLOADS_DIR, 'audios');

console.log('=== 1. SCANNING PHYSICAL AUDIO FILES ===');
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const relPath = path.relative(UPLOADS_DIR, fullPath).replace(/\\/g, '/');
      arrayOfFiles.push({
        fullPath,
        relPath: '/' + 'uploads/' + relPath,
        size: fs.statSync(fullPath).size
      });
    }
  });

  return arrayOfFiles;
}

const physicalFiles = getAllFiles(AUDIOS_DIR);
console.log(`Found ${physicalFiles.length} physical audio files in uploads/audios.`);

const fileMap = new Map();
physicalFiles.forEach(f => {
  fileMap.set(f.relPath.toLowerCase(), f);
});

// Check zero byte files
const zeroByteFiles = physicalFiles.filter(f => f.size === 0);
console.log(`Zero-byte audio files: ${zeroByteFiles.length}`);
if (zeroByteFiles.length > 0) {
  zeroByteFiles.forEach(f => console.log('  - 0-byte:', f.relPath));
}

console.log('\n=== 2. QUERYING DATABASE AUDIO REFERENCES ===');

function queryDb(sql) {
  const cmd = `docker exec be_nihongoapp-db-1 mysql -u nihongo_user -p1234 nihongo_db -N -e "${sql.replace(/"/g, '\\"')}"`;
  const res = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  return res.trim().split('\n').filter(Boolean);
}

// A. CHARACTERS
console.log('\n--- Checking characters ---');
const charRows = queryDb("SELECT id, symbol, romaji, type, IFNULL(audio_url, '') FROM characters");
console.log(`Total characters: ${charRows.length}`);
let charWithAudio = 0;
let charMissingAudio = [];
let charBrokenAudio = [];

charRows.forEach(row => {
  const [id, text, romaji, type, audioUrl] = row.split('\t');
  if (audioUrl) {
    charWithAudio++;
    const cleanUrl = audioUrl.trim().toLowerCase();
    if (!fileMap.has(cleanUrl)) {
      charBrokenAudio.push({ id, text, romaji, type, audioUrl });
    }
  } else {
    charMissingAudio.push({ id, text, romaji, type });
  }
});
console.log(`Characters with audio: ${charWithAudio}/${charRows.length}`);
console.log(`Characters missing audio (NULL): ${charMissingAudio.length}`);
console.log(`Characters with BROKEN audio (file not found): ${charBrokenAudio.length}`);
if (charBrokenAudio.length > 0) {
  console.log('Broken character audio examples:', charBrokenAudio.slice(0, 5));
}

// B. VOCABULARY
console.log('\n--- Checking vocabulary ---');
const vocabRows = queryDb("SELECT id, surface, romaji, IFNULL(audio_url, '') FROM vocabulary");
console.log(`Total vocabulary: ${vocabRows.length}`);
let vocabWithAudio = 0;
let vocabMissingAudio = [];
let vocabBrokenAudio = [];

vocabRows.forEach(row => {
  const [id, surface, romaji, audioUrl] = row.split('\t');
  if (audioUrl) {
    vocabWithAudio++;
    const cleanUrl = audioUrl.trim().toLowerCase();
    if (!fileMap.has(cleanUrl)) {
      vocabBrokenAudio.push({ id, surface, romaji, audioUrl });
    }
  } else {
    vocabMissingAudio.push({ id, surface, romaji });
  }
});
console.log(`Vocabulary with audio: ${vocabWithAudio}/${vocabRows.length}`);
console.log(`Vocabulary missing audio (NULL): ${vocabMissingAudio.length}`);
console.log(`Vocabulary with BROKEN audio (file not found): ${vocabBrokenAudio.length}`);
if (vocabBrokenAudio.length > 0) {
  console.log('Broken vocabulary audio examples:', vocabBrokenAudio.slice(0, 5));
}
if (vocabMissingAudio.length > 0) {
  console.log('Missing vocabulary audio count:', vocabMissingAudio.length);
  // Check if physical files exist matching their romaji
  let canMatchFromDisk = 0;
  vocabMissingAudio.forEach(v => {
    if (!v.romaji) return;
    const cleanRomaji = v.romaji.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const candidate = `/uploads/audios/words/${cleanRomaji}.mp3`;
    if (fileMap.has(candidate)) canMatchFromDisk++;
  });
  console.log(`  Can match from existing disk files: ${canMatchFromDisk}`);
}

// C. LESSON_QUESTIONS
console.log('\n--- Checking lesson_questions ---');
const lqRows = queryDb("SELECT id, lesson_id, question_type, IFNULL(question_text, ''), IFNULL(audio_url, '') FROM lesson_questions");
console.log(`Total lesson_questions: ${lqRows.length}`);

const typeStats = {};
let lqBrokenAudio = [];
let lqListeningMissingAudio = [];

lqRows.forEach(row => {
  const [id, lessonId, type, prompt, audioUrl] = row.split('\t');
  if (!typeStats[type]) {
    typeStats[type] = { total: 0, withAudio: 0, nullAudio: 0, brokenAudio: 0 };
  }
  typeStats[type].total++;
  if (audioUrl) {
    typeStats[type].withAudio++;
    const cleanUrl = audioUrl.trim().toLowerCase();
    if (!fileMap.has(cleanUrl)) {
      typeStats[type].brokenAudio++;
      lqBrokenAudio.push({ id, lessonId, type, prompt, audioUrl });
    }
  } else {
    typeStats[type].nullAudio++;
    if (type.includes('LISTEN') || type.includes('AUDIO')) {
      lqListeningMissingAudio.push({ id, lessonId, type, prompt });
    }
  }
});

console.log('Lesson Question Types & Audio Stats:');
console.table(typeStats);
console.log(`Total broken audio in lesson_questions: ${lqBrokenAudio.length}`);
if (lqBrokenAudio.length > 0) {
  console.log('Broken lesson_question audio examples:', lqBrokenAudio.slice(0, 10));
}
console.log(`Listening questions missing audio: ${lqListeningMissingAudio.length}`);
if (lqListeningMissingAudio.length > 0) {
  console.log('Listening questions missing audio examples:', lqListeningMissingAudio.slice(0, 10));
}

// D. LESSON_QUESTION_OPTIONS
console.log('\n--- Checking lesson_question_options ---');
const lqoRows = queryDb("SELECT id, question_id, IFNULL(option_text, ''), IFNULL(audio_url, '') FROM lesson_question_options WHERE audio_url IS NOT NULL AND audio_url != ''");
console.log(`Total options with audio: ${lqoRows.length}`);
let lqoBrokenAudio = [];
lqoRows.forEach(row => {
  const [id, qId, text, audioUrl] = row.split('\t');
  const cleanUrl = audioUrl.trim().toLowerCase();
  if (!fileMap.has(cleanUrl)) {
    lqoBrokenAudio.push({ id, qId, text, audioUrl });
  }
});
console.log(`Broken audio in options: ${lqoBrokenAudio.length}`);
if (lqoBrokenAudio.length > 0) {
  console.log('Broken options audio examples:', lqoBrokenAudio.slice(0, 5));
}

// E. QUESTIONS (Exam questions table)
console.log('\n--- Checking questions table (Exams) ---');
const qRows = queryDb("SELECT id, IFNULL(question_text, ''), IFNULL(audio_url, '') FROM questions");
console.log(`Total questions: ${qRows.length}`);
let qWithAudio = 0;
let qNullAudio = 0;
let qBrokenAudio = [];
qRows.forEach(row => {
  const [id, qText, audioUrl] = row.split('\t');
  if (audioUrl) {
    qWithAudio++;
    const cleanUrl = audioUrl.trim().toLowerCase();
    if (!fileMap.has(cleanUrl)) {
      qBrokenAudio.push({ id, qText, audioUrl });
    }
  } else {
    qNullAudio++;
  }
});
console.log(`Exam questions total: ${qRows.length}, with audio: ${qWithAudio}, null audio: ${qNullAudio}, broken audio: ${qBrokenAudio.length}`);
if (qBrokenAudio.length > 0) {
  console.log('Broken exam audio examples:', qBrokenAudio.slice(0, 5));
}

console.log('\n=== AUDIT FINISHED ===');
