const http = require('http');

const PORT = process.env.GATEWAY_PORT || 5000;
const BE_PORT = 8080;
const AI_PORT = 8000;

const server = http.createServer((req, res) => {
  // Routes to AI service if URL starts with /api/v1/conversation
  const isAi = req.url.startsWith('/api/v1/conversation');
  const targetPort = isAi ? AI_PORT : BE_PORT;

  const headers = { ...req.headers, host: `127.0.0.1:${targetPort}` };

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error -> :${targetPort}] ${req.method} ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bad Gateway',
        message: `Không kết nối được tới ${isAi ? 'AI Service (port 8000)' : 'Backend Spring Boot (port 8080)'}. Đảm bảo service đang chạy.`,
        details: err.message,
      }));
    }
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
  console.log(`🚀 Gateway Proxy listening on port ${PORT}`);
  console.log(`   👉 /api/v1/conversation/* -> http://localhost:${AI_PORT} (FastAPI AI)`);
  console.log(`   👉 Everything else        -> http://localhost:${BE_PORT} (Spring Boot BE)`);
});
