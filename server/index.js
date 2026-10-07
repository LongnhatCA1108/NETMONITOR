// ponytail: native node:http server with modular router, auth & error middlewares, SPA fallback & Tailscale sync
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// Ensure database tables and migrations are initialized
require('./db');

const { appRouter } = require('./router');
const { devicesService } = require('./modules/devices/service');
const { servicesRepo } = require('./modules/services/repo');
const { settingsService } = require('./modules/settings/service');
const checker = require('./checker');

// Tự động load .env nếu tồn tại (Node.js 20.6+ native feature)
const ENV_PATH = path.join(__dirname, '..', '.env');
if (fs.existsSync(ENV_PATH) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(ENV_PATH);
  } catch (err) {
    console.warn('[MeshGuard] Notice loading .env:', err.message);
  }
}

const PORT = process.env.PORT || 3001;
const DIST_DIR = path.join(__dirname, '..', 'client', 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

// ponytail: Background sync worker định kỳ mỗi 3 phút nếu đã có API Key
async function runBackgroundSync() {
  const { apiKey, tailnet } = settingsService.getCredentials();
  if (!apiKey || !tailnet) return;
  try {
    const result = await devicesService.syncTailscale();
    console.log(`[MeshGuard Poller] Auto-synced devices from Tailscale API:`, result.message);
  } catch (err) {
    console.error(`[MeshGuard Poller] Sync failed:`, err.message);
  }
}
const bgPoller = setInterval(runBackgroundSync, 3 * 60 * 1000);
if (bgPoller && bgPoller.unref) bgPoller.unref();

// ponytail: Background real service probe worker (kiểm tra socket TCP/HTTP thật mỗi 30s)
async function runBackgroundServiceProbes() {
  const services = servicesRepo.findAll();
  const enabled = services.filter(s => s.enabled);
  for (const svc of enabled) {
    try {
      const probe = await checker.probeService(svc);
      servicesRepo.recordProbeResult(svc.id, probe.ok, probe.latency, probe.error);
    } catch (err) {
      servicesRepo.recordProbeResult(svc.id, false, 0, err.message);
    }
  }
}
const probeWorker = setInterval(runBackgroundServiceProbes, 30 * 1000);
if (probeWorker && probeWorker.unref) probeWorker.unref();

const server = http.createServer(async (req, res) => {
  // 1. Delegate request to modular appRouter (routes + auth middleware + automatic error handler)
  const handled = await appRouter.handle(req, res);
  if (handled) return;

  // 2. Static file serving & SPA Fallback for client build
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        return res.end(content);
      } catch {}
    }

    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(content);
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[MeshGuard Server] Running on http://localhost:${PORT} (SQLite: data/meshguard.db)`);
});
