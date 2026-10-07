// ponytail: lightweight zero-dependency native router with param matching, body parser, and error pipeline
const { errorHandlerMiddleware } = require('../middlewares/errorHandler');

class Router {
  constructor() {
    this.routes = [];
    this.middlewares = [];
  }

  use(middleware) {
    if (typeof middleware === 'function') {
      this.middlewares.push(middleware);
    }
    return this;
  }

  add(method, path, ...handlers) {
    const paramNames = [];
    // Convert path like /api/devices/:nodeId/uptime to regex
    const regexPattern = path.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const regex = new RegExp(`^${regexPattern}$`);
    this.routes.push({
      method: method.toUpperCase(),
      path,
      regex,
      paramNames,
      handlers: handlers.flat(),
    });
    return this;
  }

  get(path, ...handlers) {
    return this.add('GET', path, ...handlers);
  }

  post(path, ...handlers) {
    return this.add('POST', path, ...handlers);
  }

  put(path, ...handlers) {
    return this.add('PUT', path, ...handlers);
  }

  patch(path, ...handlers) {
    return this.add('PATCH', path, ...handlers);
  }

  delete(path, ...handlers) {
    return this.add('DELETE', path, ...handlers);
  }

  async parseBody(req) {
    if (req.body !== undefined) return req.body;
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
        if (data.length > 5 * 1024 * 1024) {
          const err = new Error('Payload too large');
          err.status = 413;
          reject(err);
        }
      });
      req.on('end', () => {
        if (!data || data.trim() === '') {
          req.body = {};
          return resolve(req.body);
        }
        try {
          req.body = JSON.parse(data);
          resolve(req.body);
        } catch (e) {
          const err = new Error('Invalid JSON payload');
          err.status = 400;
          reject(err);
        }
      });
      req.on('error', reject);
    });
  }

  async handle(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // Attach standard helpers on res
    res.json = (data, status = 200) => {
      if (res.headersSent) return;
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end(JSON.stringify(data));
    };

    // Preflight OPTIONS handler
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return true;
    }

    // Attach parsed query parameters
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.pathname = pathname;

    // Find matching route
    const matchedRoute = this.routes.find(r => r.method === method && r.regex.test(pathname));

    if (!matchedRoute) {
      // If it's an API route with no match, return 404 JSON
      if (pathname.startsWith('/api')) {
        const err = new Error(`API endpoint not found: ${method} ${pathname}`);
        err.status = 404;
        errorHandlerMiddleware(err, req, res);
        return true;
      }
      return false; // Let static SPA handler process it
    }

    try {
      // Extract route params
      const match = pathname.match(matchedRoute.regex);
      req.params = {};
      if (match) {
        matchedRoute.paramNames.forEach((name, index) => {
          req.params[name] = decodeURIComponent(match[index + 1]);
        });
      }

      // Parse body for mutating HTTP methods
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        await this.parseBody(req);
      }

      // Execute global middlewares pipeline
      let mwIdx = 0;
      const nextMw = async () => {
        if (mwIdx < this.middlewares.length) {
          const mw = this.middlewares[mwIdx++];
          await mw(req, res, nextMw);
        } else {
          // Execute route handlers pipeline
          let hIdx = 0;
          const nextHandler = async () => {
            if (hIdx < matchedRoute.handlers.length) {
              const handler = matchedRoute.handlers[hIdx++];
              await handler(req, res, nextHandler);
            }
          };
          await nextHandler();
        }
      };

      await nextMw();
      return true;
    } catch (err) {
      // Automatically catch any exception in middleware or handlers
      errorHandlerMiddleware(err, req, res);
      return true;
    }
  }
}

module.exports = { Router };
