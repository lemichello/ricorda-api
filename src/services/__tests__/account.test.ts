import chai from 'chai';
import { IAccountService } from '../interfaces/IAccountService';
import { SinonStub, stub, createStubInstance } from 'sinon';
import AccountService from '../accountService';
import LoggingHelper from '../../helpers/loggingHelper';
import faker from 'faker';
import { Boom } from '@hapi/boom';
import PubSub from 'pubsub-js';
import events from '../../subscribers/events';

interface IFakeUserModel {
  _id: string;
  password: string;
  email: string;
  isVerified: boolean;
  externalType: string | null;
  save: SinonStub<[], Promise<void>>;
  checkPassword: SinonStub<[string], Promise<boolean>>;
}

let expect = chai.expect;

describe('AccountService', () => {
  describe('UpdatePassword', () => {
    let accountServiceMock: IAccountService;
    let fakeUserModel: IFakeUserModel;
    let fakeOldPassword: string;
    let fakeNewPassword: string;

    beforeEach(() => {
      fakeOldPassword = faker.internet.password();
      fakeNewPassword = faker.internet.password();

      fakeUserModel = {
        _id: faker.random.uuid(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        isVerified: faker.random.boolean(),
        externalType: null,
        save: stub(),
        checkPassword: stub(),
      };

      fakeUserModel.checkPassword.returns(
        new Promise((resolve) => {
          resolve(true);
        })
      );

      accountServiceMock = new AccountService(
        createStubInstance(LoggingHelper)
      );
    });

    it("should call 'checkPassword' once", (done) => {
      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(() => {
          // Assert
          expect(fakeUserModel.checkPassword.calledOnce).to.be.true;

          done();
        });
    });

    it('should return error, when incorrect old password', (done) => {
      fakeUserModel.checkPassword.returns(
        new Promise((resolve) => {
          resolve(false);
        })
      );

      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(({ error, payload }) => {
          // Assert
          expect(error).not.be.null;
          expect(error).to.be.instanceOf(Boom);
          expect(payload).to.be.null;

          done();
        });
    });

    it("should return error, when user isn't signed up with email", (done) => {
      // Arrange
      fakeUserModel.externalType = 'Google';

      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeNewPassword, fakeNewPassword)
        .then(({ error, payload }) => {
          // Assert
          expect(error).not.to.be.null;
          expect(error).to.be.instanceOf(Boom);
          expect(error!.output.statusCode).to.be.equal(403);
          expect(payload).to.be.null;

          done();
        });
    });

    it("should update user's password", (done) => {
      // Arrange
      fakeUserModel.password = fakeOldPassword;

      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(() => {
          // Assert
          expect(fakeUserModel.password).to.be.equal(fakeNewPassword);

          done();
        });
    });

    it("should call 'save' once", (done) => {
      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(() => {
          // Assert
          expect(fakeUserModel.save.calledOnce).to.be.true;

          done();
        });
    });

    it('should return correct result on success', (done) => {
      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.null;

          done();
        });
    });

    it('should return correct result on thrown exception', (done) => {
      fakeUserModel.save.throws('Dummy error');

      // Act
      accountServiceMock
        .UpdatePassword(fakeUserModel as any, fakeOldPassword, fakeNewPassword)
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.instanceOf(Boom);
          expect(payload).to.be.null;

          done();
        });
    });
  });

  describe('UpdateEmail', () => {
    let accountServiceMock: IAccountService;
    let fakeUserModel: IFakeUserModel;
    let fakeNewEmail: string;
    let pubSubStub: SinonStub;

    beforeEach(() => {
      fakeNewEmail = faker.internet.email();
      pubSubStub = stub(PubSub, 'publish');
      fakeUserModel = {
        _id: faker.random.uuid(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        isVerified: faker.random.boolean(),
        externalType: null,
        save: stub(),
        checkPassword: stub(),
      };

      accountServiceMock = new AccountService(
        createStubInstance(LoggingHelper)
      );
    });

    afterEach(() => {
      pubSubStub.restore();
    });

    it('should change email and verified status', (done) => {
      // Arrange
      fakeUserModel.isVerified = true;

      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(() => {
          // Assert
          expect(fakeUserModel.email).to.be.equal(fakeNewEmail);
          expect(fakeUserModel.isVerified).to.be.equal(false);

          done();
        });
    });

    it("should call 'save' once", (done) => {
      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(() => {
          // Assert
          expect(fakeUserModel.save.calledOnce).to.be.true;

          done();
        });
    });

    it('should publish to PubSub once', (done) => {
      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(() => {
          // Assert
          expect(pubSubStub.calledOnce).to.be.true;

          done();
        });
    });

    it("should call 'publish' with correct arguments", (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(({ error, payload }) => {
          receivedArgs = pubSubStub.getCall(0).args;

          // Assert
          expect(receivedArgs[0]).to.be.equal(events.user.UPDATED_EMAIL);
          expect(receivedArgs[1]).to.be.deep.equal({
            user: fakeUserModel,
          });

          done();
        });
    });

    it('should return correct result', (done) => {
      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.null;

          done();
        });
    });

    it('should return correct result on thrown duplicate exception', (done) => {
      // Arrange
      fakeUserModel.save.throws({
        errmsg: 'Found duplicate email',
      });

      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(({ error, payload }) => {
          // Assert
          expect(error).not.to.be.null;
          expect(error).to.be.instanceOf(Boom);
          expect(error!.output.statusCode).to.be.equal(400);
          expect(payload).to.be.null;

          done();
        });
    });

    it('should return correct result on thrown exception', (done) => {
      // Arrange
      fakeUserModel.save.throws('Dummy error');

      // Act
      accountServiceMock
        .UpdateEmail(fakeUserModel as any, fakeNewEmail)
        .then(({ error, payload }) => {
          // Assert
          expect(error).not.to.be.null;
          expect(error).to.be.instanceOf(Boom);
          expect(error?.output.statusCode).to.be.equal(500);
          expect(payload).to.be.null;

          done();
        });
    });
  });

  describe('GetRegistrationType', () => {
    let accountServiceMock: IAccountService;
    let fakeUserModel: IFakeUserModel;
    let fakeNewEmail: string;

    beforeEach(() => {
      fakeUserModel = {
        _id: faker.random.uuid(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        isVerified: faker.random.boolean(),
        externalType: null,
        save: stub(),
        checkPassword: stub(),
      };

      accountServiceMock = new AccountService(
        createStubInstance(LoggingHelper)
      );
    });

    it("should return 'email' registration type", (done) => {
      // Act
      accountServiceMock
        .GetRegistrationType(fakeUserModel as any)
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.equal('email');

          done();
        });
    });

    it('should return expected registration type', (done) => {
      // Arrange
      const expectedRegistrationType = faker.random.word();

      fakeUserModel.externalType = expectedRegistrationType;

      // Act
      accountServiceMock
        .GetRegistrationType(fakeUserModel as any)
        .then(({ error, payload }) => {
          // Assert
          expect(error).to.be.null;
          expect(payload).to.be.equal(expectedRegistrationType);

          done();
        });
    });
  });
});
