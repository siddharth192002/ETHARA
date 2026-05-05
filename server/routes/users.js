const express = require('express');
const auth = require('../middleware/auth');
const { getUsers } = require('../controllers/userController');

const router = express.Router();

router.use(auth);

router.get('/', getUsers);

module.exports = router;
