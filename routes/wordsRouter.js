const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair,
  getSavedWords,
  searchWords,
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.get('/count', getWordsCount);
router.get('/saved', getSavedWords);
router.post('/', createPair);
router.put('/:id', updateWordsPair);
router.post('/exists', existsWordPair);
router.post('/search', searchWords);

module.exports = router;
