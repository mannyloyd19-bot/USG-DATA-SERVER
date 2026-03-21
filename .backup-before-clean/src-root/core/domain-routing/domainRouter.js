const Domain = require('../../modules/domains/models/domain.model');

module.exports = async (req, res, next) => {
  try {
    const path = req.path;

    // ignore API routes
    if (path.startsWith('/api') || path.startsWith('/uploads')) {
      return next();
    }

    // find matching domain route
    const domain = await Domain.findOne({
      where: {
        routePath: path,
        status: 'active'
      }
    });

    if (!domain) return next();

    // attach domain info
    req.usgDomain = domain;

    // simple mapping (serve static page)
    return res.sendFile('index.html', {
      root: process.cwd() + '/public'
    });

  } catch (err) {
    console.error('Domain routing error:', err.message);
    return next();
  }
};
