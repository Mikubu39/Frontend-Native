const { networkInterfaces } = require("os");
const fs = require("fs");
const path = require("path");

const nets = networkInterfaces();
let localIp = "localhost"; // fallback

const candidates = [];

for (const name of Object.keys(nets)) {
  const isVirtual = /vEthernet|wsl|virtual|vmware|loopback/i.test(name);
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      if (!isVirtual) {
        candidates.unshift(net.address); // Prioritize real physical Wi-Fi / Ethernet
      } else {
        candidates.push(net.address);
      }
    }
  }
}

if (candidates.length > 0) {
  localIp = candidates[0];
}

const envPath = path.join(process.cwd(), ".env");
const port = "8080";
const newApiUrl = `http://${localIp}:${port}`;

let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

const currentUrlMatch = envContent.match(/EXPO_PUBLIC_API_URL=(.*)/);
const currentUrl = currentUrlMatch ? currentUrlMatch[1].trim() : "";
const force = process.argv.includes("--force") || process.argv.includes("--local");

if (currentUrl && (currentUrl.startsWith("https://") || currentUrl.includes("ngrok")) && !force) {
  console.log(`ℹ️ Preserving existing external API URL: ${currentUrl}`);
  process.exit(0);
}

if (envContent.includes("EXPO_PUBLIC_API_URL=")) {
  // Update existing
  envContent = envContent.replace(
    /EXPO_PUBLIC_API_URL=.*/g,
    `EXPO_PUBLIC_API_URL=${newApiUrl}`,
  );
} else {
  // Append new
  envContent += `\nEXPO_PUBLIC_API_URL=${newApiUrl}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + "\n");
console.log(`✅ Auto-updated .env with local IP: ${newApiUrl}`);
