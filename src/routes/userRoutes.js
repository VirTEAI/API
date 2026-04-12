const express = require('express');
const { getUsers, createUser, getSessionData } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/session-data/:userId', getSessionData);

module.exports = router;