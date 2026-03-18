const express = require('express');
const controller = require('../controllers/bootstrap.controller');

const router = express.Router();

router.post('/create-user', controller.createUserWithMasterKey);

module.exports = router;
