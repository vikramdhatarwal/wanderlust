// Send errors from async route functions to Express's main error handler.
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports = wrapAsync;
