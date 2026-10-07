// ponytail: centralized error handler middleware catching exceptions and returning standard JSON response
function errorHandlerMiddleware(err, req, res) {
  const status = Number(err.status || err.statusCode) || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[MeshGuard Error] ${req.method} ${req.url} [${status}]:`, err.message || err);

  if (!res.headersSent) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end(
      JSON.stringify({
        error: message,
        status,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

module.exports = { errorHandlerMiddleware };
