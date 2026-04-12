const express = require('express');
const { getSessionId, generateSessionId, attachSessionData } = require('../controllers/sessionController');

const router = express.Router();

router.get('get-id/:sessionId', getSessionId);
router.post('/generate-id', generateSessionId);
router.post('/attach', attachSessionData);

module.exports = router;