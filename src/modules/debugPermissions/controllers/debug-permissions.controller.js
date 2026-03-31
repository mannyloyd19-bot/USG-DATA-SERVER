exports.me = async (req, res) => {
  try {
    const user = req.user || null;

    return res.json({
      success: true,
      message: 'Permission debug payload',
      data: {
        authenticated: Boolean(user),
        user: user ? {
          id: user.id || null,
          username: user.username || null,
          role: user.role || null,
          type: user.type || 'user',
          permissions: Array.isArray(user.permissions) ? user.permissions : []
        } : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
