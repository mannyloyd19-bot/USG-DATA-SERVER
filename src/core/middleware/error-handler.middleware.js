module.exports = (err, req, res, next) => {
  console.error('Unhandled application error:', {
    requestId: req.requestId || null,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    requestId: req.requestId || null
  });
};
