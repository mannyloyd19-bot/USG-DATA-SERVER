module.exports = (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId || null
  });
};
