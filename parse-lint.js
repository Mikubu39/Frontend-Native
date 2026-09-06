const fs = require("fs");
const data = JSON.parse(
  fs
    .readFileSync(
      "c:/Users/Endministrator/Pictures/Frontend-Native/lint-results.json",
      "utf16le",
    )
    .replace(/^\uFEFF/, ""),
);
const out = [];
data.forEach((file) => {
  if (file.messages.length > 0) {
    file.messages.forEach((msg) => {
      out.push(`${file.filePath}:${msg.line} - ${msg.ruleId} - ${msg.message}`);
    });
  }
});
fs.writeFileSync(
  "c:/Users/Endministrator/Pictures/Frontend-Native/lint-parsed.txt",
  out.join("\n"),
);
console.log(`Found ${out.length} issues.`);
