const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/search.controller");
const auth = require("../../../middleware/auth.middleware");

router.use(auth);

router.get("/global", ctrl.globalSearch);

module.exports = router;
