module.exports = (req, res, next) => {
  res.success = (data = {}, message = 'Success') => {
    return res.json({
      success: true,
      message,
      data,
      requestId: req.requestId
    });
  };

  res.fail = (message = 'Error', status = 400) => {
    return res.status(status).json({
      success: false,
      message,
      requestId: req.requestId
    });
  };

  next();
};
