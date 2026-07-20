const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      callback(path.join(dir, f));
    }
  });
}

function roundCorners(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern to find `borderRadius: <number>`
  const regex = /borderRadius:\s*(\d+)/g;
  
  content = content.replace(regex, (match, p1) => {
    let val = parseInt(p1, 10);
    if (val === 0) return 'borderRadius: 16';
    if (val < 16) return `borderRadius: ${val + 12}`;
    if (val < 999) return `borderRadius: ${val + 8}`;
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

const targetDirs = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'components')
];

targetDirs.forEach(dir => {
  walkDir(dir, roundCorners);
});

console.log('Finished updating border radii.');
