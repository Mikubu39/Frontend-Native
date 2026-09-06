const { spawn } = require('child_process');
const path = require('path');

// 1. Khởi động Gateway Proxy lắng nghe cổng 5000 (tự động điều phối sang 8080 và 8000)
require('./proxy-gateway');

// 2. Mở Ngrok trỏ thẳng vào cổng 5000
const ngrokExe = path.join(__dirname, 'ngrok.exe');
const ngrokProcess = spawn(ngrokExe, ['http', '5000', '--url=equation-animate-outback.ngrok-free.dev'], {
  stdio: 'inherit',
  shell: true,
});

ngrokProcess.on('close', (code) => {
  process.exit(code || 0);
});
