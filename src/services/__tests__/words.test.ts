import chai from 'chai';
import { IWordsService } from '../interfaces/IWordsService';
import faker from 'faker';
import WordsService from '../wordsService';
import { createStubInstance, SinonStub, stub, spy, SinonSpy } from 'sinon';
import LoggingHelper from '../../helpers/loggingHelper';
import { IWordPairModel } from '../../models/wordsPairModel';
import IWordPair from '../../interfaces/IWordPair';
import moment from 'moment';
import lodash from 'lodash';
import { Types } from 'mongoose';

interface IFakeWordPairModel {
  _id: string;
  userId: string;
  sourceWord: string;
  translation: string;
  repetitions: number;
  maxRepetitions: number;
  repetitionInterval: number;
  nextRepetitionDate: Date;
  sentences: string[];
  create: SinonStub<[object], Promise<IWordPairModel>>;
  aggregate: SinonStub<[], IFakeWordPairModel>;
  match: SinonStub<[object], IFakeWordPairModel>;
  project: SinonStub<[object], IFakeWordPairModel>;
  exec: SinonStub<[], Promise<IWordPair[]>>;
}

function generateRandomSentencesArray(): string[] {
  const arrayLength: number = faker.random.number(10);
  const resultArray: string[] = [];

  for (let i = 0; i < arrayLength; i++) {
    resultArray.push(faker.random.word());
  }

  return resultArray;
}

function generateFakeWordPair(): IWordPair {
  const fakeMaxRepetitions = faker.random.number({
    min: 1,
    max: 15,
  });

  return {
    _id: faker.random.uuid(),
    userId: faker.random.uuid(),
    sourceWord: faker.random.word(),
    translation: faker.random.word(),
    repetitions: faker.random.number({
      min: 0,
      max: fakeMaxRepetitions,
    }),
    maxRepetitions: fakeMaxRepetitions,
    repetitionInterval: faker.random.number({
      min: 1,
    }),
    nextRepetitionDate: faker.date.future(),
    sentences: generateRandomSentencesArray(),
  };
}

let expect = chai.expect;

describe('WordsService', () => {
  let wordsServiceMock: IWordsService;
  let fakeWordPairModel: IFakeWordPairModel;
  let mongooseTypesStub: SinonStub;

  beforeEach(() => {
    fakeWordPairModel = {
      ...generateFakeWordPair(),
      create: stub(),
      aggregate: stub(),
      match: stub(),
      project: stub(),
      exec: stub(),
    };

    fakeWordPairModel.aggregate.returns(fakeWordPairModel);
    fakeWordPairModel.match.returns(fakeWordPairModel);
    fakeWordPairModel.project.returns(fakeWordPairModel);
    fakeWordPairModel.exec.returns(
      Promise.resolve([generateFakeWordPair(), generateFakeWordPair()])
    );

    mongooseTypesStub = stub(Types, 'ObjectId');

    wordsServiceMock = new WordsService(
      fakeWordPairModel as any,
      createStubInstance(LoggingHelper)
    );
  });

  afterEach(() => {
    mongooseTypesStub.restore();
  });

  describe('CreateWordPair', () => {
    let momentSpy: SinonSpy;

    beforeEach(() => {
      momentSpy = spy(moment.fn, 'add');
    });

    afterEach(() => {
      momentSpy.restore();
    });

    it("should call 'create' function once", (done) => {
      // Act
      wordsServiceMock
        .CreateWordPair(faker.random.uuid(), generateFakeWordPair())
        .then(() => {
          // Assert
          expect(fakeWordPairModel.create.calledOnce).to.be.true;

          done();
        });
    });

    it('should return correct result on success', (done) => {
      // Act
      wordsServiceMock
        .CreateWordPair(faker.random.uuid(), generateFakeWordPair())
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.not.null;

          done();
        });
    });

    it('should return correct result on thrown exception', (done) => {
      // Arrange
      fakeWordPairModel.create.throws('Dummy error');

      // Act
      wordsServiceMock
        .CreateWordPair(faker.random.uuid(), generateFakeWordPair())
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.not.null;
          expect(payload).to.be.null;

          done();
        });
    });

    it("should call 'add' of moment method with correct parameters", (done) => {
      // Arrange
      let generatedWordPair = generateFakeWordPair();
      let receivedArgs: any[] = [];

      // Act
      wordsServiceMock
        .CreateWordPair(faker.random.uuid(), generatedWordPair)
        .then(() => {
          receivedArgs = momentSpy.getCall(0).args;

          // Assert
          expect(receivedArgs[0]).to.be.equal(
            generatedWordPair.repetitionInterval
          );
          expect(receivedArgs[1]).to.be.equal('hours');

          done();
        });
    });
  });

  describe('GetWordsForRepeating', () => {
    let lodashShuffleSpy: SinonSpy;

    beforeEach(() => {
      lodashShuffleSpy = spy(lodash, 'shuffle');
    });

    afterEach(() => {
      lodashShuffleSpy.restore();
    });

    it("should call 'shuffle' method once", (done) => {
      // Act
      wordsServiceMock.GetWordsForRepeating(faker.random.uuid()).then(() => {
        // Assert
        expect(lodashShuffleSpy.calledOnce).to.be.true;

        done();
      });
    });

    it('should return correct result on success', (done) => {
      // Act
      wordsServiceMock
        .GetWordsForRepeating(faker.random.uuid())
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.not.null;
          expect(payload).to.be.deep.equal(lodashShuffleSpy.returnValues[0]);

          done();
        });
    });

    it('should return correct result of thrown exception', (done) => {
      // Arrange
      fakeWordPairModel.exec.throws('Dummy error');

      // Act
      wordsServiceMock
        .GetWordsForRepeating(faker.random.uuid())
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.not.null;
          expect(payload).to.be.null;

          done();
        });
    });
  });
});
