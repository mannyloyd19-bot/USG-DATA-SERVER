const axios = require('axios');

exports.check = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL required' });
    }

    const response = await axios.get(url, { timeout: 5000 }).catch(() => null);

    return res.json({
      success: true,
      url,
      reachable: !!response,
      status: response?.status || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
