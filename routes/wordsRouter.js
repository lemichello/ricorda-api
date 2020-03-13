const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  repeatWord
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.post('/', createPair);
router.put('/:id', repeatWord);

module.exports = router;
