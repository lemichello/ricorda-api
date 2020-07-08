import moment from 'moment';
import IWordPair from '../interfaces/IWordPair';
import { Types } from 'mongoose';
import { shuffle } from 'lodash';
import { ISavedWordsResponse, IWordsService } from './interfaces/IWordsService';
import { ILoggingHelper } from '../helpers/interfaces/ILoggingHelper';
import { IServiceResponse } from '../interfaces/IServiceResponse';
import { internal, badRequest } from '@hapi/boom';
import { IWordPairModel } from '../models/wordsPairModel';

export default class WordsService implements IWordsService {
  private pageSize = 15;
  private wordPairModel: Models.WordPairModel;
  private loggingHelper: ILoggingHelper;

  constructor(
    wordPairModel: Models.WordPairModel,
    loggingHelper: ILoggingHelper
  ) {
    this.wordPairModel = wordPairModel;
    this.loggingHelper = loggingHelper;
  }

  public async CreateWordPair(
    userId: string,
    wordPair: Partial<IWordPair>
  ): Promise<IServiceResponse<IWordPair>> {
    try {
      let nextRepetitionDate = moment()
        .add(wordPair.repetitionInterval, 'hours')
        .toDate();

      let newWordPair = await this.wordPairModel.create({
        ...wordPair,
        nextRepetitionDate,
        userId: userId,
      } as IWordPairModel);

      this.loggingHelper.info(`Created new word pair for user: ${userId}`);

      return {
        error: null,
        payload: newWordPair,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't create new word pair: ${e}`, {
        userId: userId,
        requestData: wordPair,
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async GetWordsForRepeating(
    userId: string
  ): Promise<IServiceResponse<IWordPair[]>> {
    try {
      let todayDate = new Date();

      let words: IWordPair[] = await this.wordPairModel
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

      this.loggingHelper.info(`Sent words for repeating to user: ${userId}`);

      return {
        error: null,
        payload: words,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't get words for repeating: ${e}`, {
        userId: userId,
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async GetSavedWords(
    page: number,
    word: string,
    userId: string
  ): Promise<IServiceResponse<ISavedWordsResponse>> {
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
          .sort({ repetitions: 1, maxRepetitions: -1, sourceWord: 1 })
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

      /**
       * Sorting words by their 'finished' value.
       * e.g. {repetitions: 1, maxRepetitions: 2} word pair will be treated as
       * more finished than {repetitions: 2, maxRepetitions: 5} word pair,
       * because the 'finished' value of the first word pair will be 0.5, whereas
       * second pair's value will be 0.4.
       */
      const sortedWords = words.sort(
        (a, b) =>
          a.repetitions / a.maxRepetitions - b.repetitions / b.maxRepetitions
      );

      this.loggingHelper.info(`Sent saved words for user: ${userId}`);

      let result: ISavedWordsResponse = {
        data: {
          words: sortedWords,
          count: count,
        },
        page,
        next,
      };

      return {
        error: null,
        payload: result,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't send saved words: ${e}`, {
        userId: userId,
        requestData: { page, word },
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async UpdateWordPair(
    wordPair: Partial<IWordPair>,
    wordPairId: string,
    userId: string
  ): Promise<IServiceResponse<IWordPair>> {
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
      this.loggingHelper.error(`Can't update word pair: ${e}`, {
        userId: userId,
        requestData: { wordPair, wordPairId, userId },
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }

    if (!updatedDoc) {
      return {
        error: badRequest('Received incorrect word pair'),
        payload: null,
      };
    }

    this.loggingHelper.info(`Updated word pair for user: ${userId}`);

    return {
      error: null,
      payload: updatedDoc,
    };
  }

  public async GetWordsCount(
    userId: string
  ): Promise<IServiceResponse<number>> {
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

      this.loggingHelper.info(`Sent words count for user: ${userId}`);

      return {
        error: null,
        payload: result[0]?.documentsCount || 0,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't send words count: ${e}`, {
        userId: userId,
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async WordPairExists(
    sourceWord: string,
    userId: string
  ): Promise<IServiceResponse<boolean>> {
    try {
      const exists = await this.wordPairModel.exists({
        userId: userId,
        sourceWord: sourceWord,
      });

      this.loggingHelper.info(
        `Sent word pair existence result to user: ${userId}`
      );
      return {
        error: null,
        payload: exists,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't send word pair existence result: ${e}`, {
        userId: userId,
        requestData: { sourceWord },
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }
}
