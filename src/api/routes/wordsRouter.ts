import { Router } from 'express';
import {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair,
  getSavedWords,
} from '../controllers/wordsController';

const router = Router();

router.get('/', getWordsForRepeating);
router.get('/count', getWordsCount);
router.post('/saved/:page', getSavedWords);
router.post('/', createPair);
router.put('/:id', updateWordsPair);
router.post('/exists', existsWordPair);

export default router;
