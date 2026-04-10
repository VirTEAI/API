const express = require('express');
const { attachSessionData, generateSessionId } = require('../controllers/sessionController');

const router = express.Router();

router.post('/attach', attachSessionData);
router.post('/generate-id', generateSessionId);

module.exports = router;