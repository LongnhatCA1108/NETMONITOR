// ponytail: Real TCP socket & HTTP probe runner (zero npm dependencies, pure node standard library)
const net = require('node:net');

/**
 * Real TCP socket connection probe
 * @param {string} ip - Target IP address
 * @param {number} port - Target Port
 * @param {number} timeoutMs - Timeout in milliseconds (default 3000)
 */
function probeTcp(ip, port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let isSettled = false;

    const finish = (ok, latency, error) => {
      if (isSettled) return;
      isSettled = true;
      socket.destroy();
      resolve({ ok, latency, error });
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      const latency = Date.now() - start;
      finish(true, latency, null);
    });

    socket.on('timeout', () => {
      finish(false, 0, `ETIMEDOUT: Không nhận được phản hồi sau ${timeoutMs}ms`);
    });

    socket.on('error', (err) => {
      finish(false, 0, err.code ? `${err.code}: ${err.message}` : err.message);
    });

    try {
      socket.connect(Number(port), ip);
    } catch (err) {
      finish(false, 0, err.message);
    }
  });
}

/**
 * Real HTTP probe
 * @param {string} ip - Target IP address
 * @param {number} port - Target Port
 * @param {string} path - Request path (e.g. /health)
 * @param {number} timeoutMs - Timeout in milliseconds
 */
async function probeHttp(ip, port, path = '/', timeoutMs = 4000) {
  const start = Date.now();
  const cleanPath = path && path.startsWith('/') ? path : `/${path || ''}`;
  const url = `http://${ip}:${port}${cleanPath}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs)
    });
    const latency = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;
    return {
      ok,
      latency,
      status: res.status,
      error: ok ? null : `HTTP ${res.status} ${res.statusText}`
    };
  } catch (err) {
    return {
      ok: false,
      latency: 0,
      status: null,
      error: err.name === 'TimeoutError' ? `Timeout sau ${timeoutMs}ms` : err.message
    };
  }
}

/**
 * Run real probe for a service
 */
async function probeService(service, hostIp) {
  const ip = hostIp || service.ip;
  if (!ip) {
    return { ok: false, latency: 0, error: 'Thiếu địa chỉ IP của thiết bị' };
  }

  if (service.type === 'http') {
    return await probeHttp(ip, service.port, service.path, 4000);
  } else {
    return await probeTcp(ip, service.port, 3000);
  }
}

module.exports = {
  probeTcp,
  probeHttp,
  probeService
};
