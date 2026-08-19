const { networkInterfaces } = require("os");
const fs = require("fs");
const path = require("path");

const nets = networkInterfaces();
let localIp = "localhost"; // fallback

// Find the first non-internal IPv4 address
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      localIp = net.address;
      break;
    }
  }
  if (localIp !== "localhost") break;
}

const envPath = path.join(process.cwd(), ".env");
const port = "8080";
const newApiUrl = `http://${localIp}:${port}`;

let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
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
