// ponytail: auth middleware passing 100% requests through for now
function authMiddleware(req, res, next) {
  // Pass-through: allows all incoming requests through without filtering
  return next();
}

module.exports = { authMiddleware };
