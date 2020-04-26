const { Router } = require('express');
const {
  updatePassword,
  updateEmail,
} = require('../controllers/accountController');

const router = Router();

router.put('/update-password', updatePassword);
router.put('/update-email', updateEmail);

module.exports = router;
