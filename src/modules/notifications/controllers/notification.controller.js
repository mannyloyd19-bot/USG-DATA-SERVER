const service = require("../services/notification.service");

exports.list = (req, res) => {
  res.json({
    success: true,
    unread: service.unreadCount(),
    notifications: service.list()
  });
};

exports.create = (req, res) => {
  const item = service.create(req.body);
  res.json({ success: true, notification: item });
};

exports.markRead = (req, res) => {
  const item = service.markRead(req.params.id);
  res.json({ success: true, notification: item });
};

exports.markAllRead = (req, res) => {
  service.markAllRead();
  res.json({ success: true });
};

exports.remove = (req, res) => {
  service.remove(req.params.id);
  res.json({ success: true });
};
