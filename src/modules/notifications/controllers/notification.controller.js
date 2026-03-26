const service = require("../services/notification.service");

exports.list = (req, res) => {
  try {
    res.json({
      success: true,
      unread: service.unreadCount(),
      notifications: service.list()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.create = (req, res) => {
  try {
    const item = service.create(req.body || {});
    res.json({
      success: true,
      notification: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.testSeed = (req, res) => {
  try {
    const item = service.create({
      title: "Test Notification",
      message: "Manual test notification created successfully.",
      level: "info",
      source: "notifications"
    });

    res.json({
      success: true,
      notification: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markRead = (req, res) => {
  try {
    const item = service.markRead(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      notification: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAllRead = (req, res) => {
  try {
    service.markAllRead();
    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.remove = (req, res) => {
  try {
    service.remove(req.params.id);
    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
