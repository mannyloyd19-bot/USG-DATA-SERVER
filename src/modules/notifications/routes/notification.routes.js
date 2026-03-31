const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require("express");
const router = express.Router();
router.use(authMiddleware);
const ctrl = require("../controllers/notification.controller");
const auth = require("../../../middleware/auth.middleware");

router.use(auth);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.post("/test-seed", ctrl.testSeed);
router.patch("/:id/read", ctrl.markRead);
router.post("/mark-all-read", ctrl.markAllRead);
router.delete("/:id", ctrl.remove);

module.exports = router;
