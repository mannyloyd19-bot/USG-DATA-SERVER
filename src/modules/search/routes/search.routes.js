const authMiddleware = require('../../../middleware/auth.middleware');
const requirePermission = require('../../../middleware/permission.middleware');
const express = require("express");
const router = express.Router();
router.use(authMiddleware);
const ctrl = require("../controllers/search.controller");
const auth = require("../../../middleware/auth.middleware");

router.use(auth);

router.get("/global", ctrl.globalSearch);

module.exports = router;
