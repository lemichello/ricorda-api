const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.get('/count', getWordsCount);
router.post('/', createPair);
router.put('/:id', updateWordsPair);
router.post('/exists', existsWordPair);

module.exports = router;
