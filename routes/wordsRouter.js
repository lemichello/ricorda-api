const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  updateWordsPair
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.post('/', createPair);
router.put('/:id', updateWordsPair);

module.exports = router;
