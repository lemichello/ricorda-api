const { Router } = require('express');
const { logIn, signUp } = require('../controllers/authController');

const router = Router();

router.post('/login', logIn);
router.post('/signup', signUp);

module.exports = router;
