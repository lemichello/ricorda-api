const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.get('/count', getWordsCount);
router.post('/', createPair);
router.put('/:id', updateWordsPair);

module.exports = router;
