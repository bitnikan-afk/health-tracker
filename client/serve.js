// Dev server: serves static files + proxies /api/* to backend
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const BACKEND = 'http://localhost:4000';

// Proxy /api/* → backend (Express strips /api prefix, so we target /api on backend too)
app.use('/api', createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  // Don't strip /api because Express already does via app.use('/api', ...)
  // But http-proxy-middleware v3 with prependPath might...
  // Explicit: keep /api in path so backend gets /api/v1/...
  pathRewrite: (path, req) => '/api' + path
}));

// Socket.io proxy
app.use('/socket.io', createProxyMiddleware({
  target: BACKEND,
  changeOrigin: true,
  ws: true,
}));

// Static files
app.use(express.static(path.join(__dirname)));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════╗
║     HEALTH TRACKER PWA v0.1        ║
║──────────────────────────────────────║
║  http://localhost:${PORT}            ║
║  Backend: ${BACKEND}                ║
╚══════════════════════════════════════╝
  `);
});
