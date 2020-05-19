import moment from 'moment';
import IWordPair from '../interfaces/IWordPair';
import logger from '../helpers/loggingHelper';
import { Types } from 'mongoose';
import { shuffle } from 'lodash';
import { ISavedWordsResponse, IWordsService } from './interfaces/IWordsService';

export default class WordsService implements IWordsService {
  private pageSize = 15;
  private wordPairModel: Models.WordPairModel;

  constructor({ wordPairModel }: { wordPairModel: Models.WordPairModel }) {
    this.wordPairModel = wordPairModel;
  }

  public async CreateWordPair(
    userId: string,
    wordPair: Partial<IWordPair>
  ): Promise<IWordPair> {
    try {
      let nextRepetitionDate = moment().add(
        wordPair.repetitionInterval,
        'hours'
      );

      let newWordPair = await this.wordPairModel.create({
        ...wordPair,
        nextRepetitionDate,
        userId: userId,
      });

      logger.info(`Created new word pair for user: ${userId}`);

      return newWordPair;
    } catch (e) {
      logger.error(`Can't create new word pair: ${e}`, {
        userId: userId,
        requestData: wordPair,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async GetWordsForRepeating(userId: string): Promise<IWordPair[]> {
    try {
      let todayDate = new Date();

      let words = await this.wordPairModel
        .aggregate()
        .match({
          userId: Types.ObjectId(userId),
          nextRepetitionDate: { $lte: todayDate },
        })
        .project({
          repetitionsCmp: { $cmp: ['$repetitions', '$maxRepetitions'] },
          repetitions: 1,
          sourceWord: 1,
          translation: 1,
          nextRepetitionDate: 1,
          maxRepetitions: 1,
          repetitionInterval: 1,
          sentences: 1,
        })
        .match({
          repetitionsCmp: -1,
        })
        .project({
          repetitionsCmp: 0,
        })
        .exec();

      words = shuffle(words);

      logger.info(`Sent words for repeating to user: ${userId}`);
      return words;
    } catch (e) {
      logger.error(`Can't get words for repeating: ${e}`, {
        userId: userId,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async GetSavedWords(
    page: number,
    word: string,
    userId: string
  ): Promise<ISavedWordsResponse> {
    try {
      const [words, count] = await Promise.all([
        this.wordPairModel
          .find({ userId: userId })
          .or([
            { sourceWord: { $regex: word, $options: 'i' } },
            { translation: { $regex: word, $options: 'i' } },
          ])
          .limit(this.pageSize)
          .skip((page - 1) * this.pageSize)
          .sort({ repetitions: 1, sourceWord: 1 })
          .select('-userId -__v -repetitionInterval')
          .lean()
          .exec(),
        this.wordPairModel
          .find({ userId: userId })
          .or([
            { sourceWord: { $regex: word, $options: 'i' } },
            { translation: { $regex: word, $options: 'i' } },
          ])
          .countDocuments(),
      ]);

      const next = count > this.pageSize * page;

      logger.info(`Sent saved words for user: ${userId}`);

      return {
        data: words,
        page,
        next,
      };
    } catch (e) {
      logger.error(`Can't send saved words: ${e}`, {
        userId: userId,
        requestData: { page, word },
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async UpdateWordPair(
    wordPair: Partial<IWordPair>,
    wordPairId: string,
    userId: string
  ): Promise<IWordPair> {
    let updatedDoc: IWordPair | null;

    try {
      updatedDoc = await this.wordPairModel
        .findOneAndUpdate(
          { _id: wordPairId, userId: userId },
          {
            ...wordPair,
          },
          { new: true }
        )
        .lean()
        .exec();
    } catch (e) {
      logger.error(`Can't update word pair: ${e}`, {
        userId: userId,
        requestData: { wordPair, wordPairId, userId },
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }

    if (!updatedDoc) {
      throw {
        status: 400,
        message: 'Received incorrect word pair',
      };
    }

    logger.info(`Updated word pair for user: ${userId}`);

    return updatedDoc;
  }

  public async GetWordsCount(userId: string): Promise<number> {
    try {
      let todayDate = new Date();
      const result = await this.wordPairModel
        .aggregate()
        .match({
          userId: Types.ObjectId(userId),
          nextRepetitionDate: { $lte: todayDate },
        })
        .project({
          repetitionsCmp: { $cmp: ['$repetitions', '$maxRepetitions'] },
        })
        .match({
          repetitionsCmp: -1,
        })
        .count('documentsCount')
        .exec();

      logger.info(`Sent words count for user: ${userId}`);
      return result[0]?.documentsCount || 0;
    } catch (e) {
      logger.error(`Can't send words count: ${e}`, {
        userId: userId,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async WordPairExists(
    sourceWord: string,
    userId: string
  ): Promise<boolean> {
    try {
      const exists = await this.wordPairModel.exists({
        userId: userId,
        sourceWord: sourceWord,
      });

      logger.info(`Sent word pair existence result to user: ${userId}`);
      return exists;
    } catch (e) {
      logger.error(`Can't send word pair existence result: ${e}`, {
        userId: userId,
        requestData: { sourceWord },
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }
}
