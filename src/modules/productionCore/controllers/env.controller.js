exports.list = (req, res) => {
  return res.json({
    success: true,
    env: Object.keys(process.env).map(k => ({
      key: k,
      value: process.env[k]
    }))
  });
};
