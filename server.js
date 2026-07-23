const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const os = require('os');

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const startedAt = new Date();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(text);
}

function getSystemInfo() {
  return {
    app: 'test-sealos',
    version: '1.0.0',
    env: NODE_ENV,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    uptimeSeconds: Math.floor(process.uptime()),
    startedAt: startedAt.toISOString(),
    memory: {
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
    port: PORT,
    host: HOST,
  };
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, 'public', path.normalize(safePath).replace(/^(\.\.[/\\])+/, ''));

  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, 'Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  // CORS for simple API demos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/health' || pathname === '/healthz') {
    sendJson(res, 200, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
    return;
  }

  if (pathname === '/api/hello') {
    const name = url.searchParams.get('name') || 'Sealos';
    sendJson(res, 200, {
      message: `你好，${name}！`,
      greeting: `Hello, ${name}!`,
      from: 'test-sealos',
      time: new Date().toISOString(),
    });
    return;
  }

  if (pathname === '/api/info') {
    sendJson(res, 200, getSystemInfo());
    return;
  }

  if (pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'API not found', path: pathname });
    return;
  }

  serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`[${NODE_ENV}] Server running at http://${HOST}:${PORT}/`);
  console.log(`Health check: http://${HOST}:${PORT}/api/health`);
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
