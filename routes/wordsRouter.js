const { Router } = require('express');
const {
  createPair,
  getWordsForRepeating,
  repeatWords
} = require('../controllers/wordsController');

const router = Router();

router.get('/', getWordsForRepeating);
router.post('/', createPair);
router.put('/:id', repeatWords);

module.exports = router;
