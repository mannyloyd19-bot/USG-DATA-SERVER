exports.ok = (res, data = {}, message = 'OK') => {
  return res.json({
    success: true,
    message,
    data
  });
};

exports.fail = (res, message = 'Error', status = 400, extra = {}) => {
  return res.status(status).json({
    success: false,
    message,
    ...extra
  });
};
