const express = require('express');
const router = express.Router();
const controller = require('../controllers/rbac.controller');

router.post('/seed', controller.seed);
router.get('/roles', controller.listRoles);
router.get('/permissions', controller.listPermissions);
router.post('/assign-role', controller.assignRoleToUser);
router.post('/attach-permission', controller.attachPermissionToRole);
router.get('/my-permissions', controller.myPermissions);

module.exports = router;
