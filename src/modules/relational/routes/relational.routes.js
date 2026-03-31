const requirePermission = require('../../../middleware/permission.middleware');
const express = require('express');
const controller = require('../controllers/relational.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const adminMiddleware = require('../../../middleware/admin.middleware');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/tables', controller.createTable);
router.get('/tables', controller.listTables);

router.post('/tables/:tableKey/columns', controller.createColumn);
router.get('/tables/:tableKey/columns', controller.listColumns);

router.post('/tables/:tableKey/rows', controller.createRow);
router.get('/tables/:tableKey/rows', controller.listRows);

module.exports = router;
