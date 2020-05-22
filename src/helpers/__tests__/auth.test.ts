import chai from 'chai';
import { Response } from 'express';
import {
  spy,
  stub,
  SinonStub,
  replace,
  SinonSpy,
  createStubInstance,
  SinonStubbedInstance,
} from 'sinon';
import faker from 'faker';
import { IUser } from '../../interfaces/IUser';
import jsonwebtoken from 'jsonwebtoken';
import config from '../../config';
import EmailHelper from '../emailHelper';
import AuthHelper from '../authHelper';

let expect = chai.expect;

function getUserMock(): IUser {
  return {
    _id: faker.random.uuid(),
    email: faker.internet.email(),
    password: faker.random.word(),
    isVerified: true,
    tokenVersion: 0,
    externalId: null,
    externalType: null,
  };
}

describe('AuthHelper', () => {
  let fakeEmailSecret = faker.random.uuid();
  let fakeAccessTokenSecret = faker.random.uuid();
  let fakeRefreshTokenSecret = faker.random.uuid();

  replace(config.secrets, 'emailSecret', fakeEmailSecret);
  replace(config.secrets, 'accessTokenSecret', fakeAccessTokenSecret);
  replace(config.secrets, 'refreshTokenSecret', fakeRefreshTokenSecret);

  describe('createAccessToken', () => {
    let userMock: IUser;
    let authHelperMock: AuthHelper;
    let signStub: SinonStub;

    beforeEach(() => {
      userMock = getUserMock();
      authHelperMock = new AuthHelper(createStubInstance(EmailHelper));
      signStub = stub(jsonwebtoken, 'sign');
    });

    afterEach(() => {
      signStub.restore();
    });

    it("should call 'sign' method once", (done) => {
      // Act
      authHelperMock.createAccessToken(userMock);

      // Assert
      expect(signStub.calledOnce).to.be.true;

      done();
    });

    it("should call 'sign' method with correct parameters", (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      authHelperMock.createAccessToken(userMock);
      receivedArgs = signStub.getCall(0).args;

      // Assert
      expect(receivedArgs[0]).to.be.deep.equal({
        id: userMock._id,
      });
      expect(receivedArgs[1]).to.be.equal(fakeAccessTokenSecret);
      expect(receivedArgs[2]).to.be.deep.equal({
        expiresIn: '15m',
      });

      done();
    });
  });

  describe('createRefreshToken', () => {
    let userMock: IUser;
    let authHelperMock: AuthHelper;
    let signStub: SinonStub;

    beforeEach(() => {
      userMock = getUserMock();
      authHelperMock = new AuthHelper(createStubInstance(EmailHelper));
      signStub = stub(jsonwebtoken, 'sign');
    });

    afterEach(() => {
      signStub.restore();
    });

    it("should call 'sign' method once", (done) => {
      // Act
      authHelperMock.createRefreshToken(userMock, true);

      // Assert
      expect(signStub.calledOnce).to.be.true;

      done();
    });

    it("should call 'sign' method with correct parameters", (done) => {
      // Arrange
      let expectedFirstParameter = {
        id: userMock._id,
        tokenVersion: userMock.tokenVersion,
        isSessionToken: true,
      };
      let receivedArgs: any[];

      // Act
      authHelperMock.createRefreshToken(userMock, true);
      receivedArgs = signStub.getCall(0).args;

      // Assert
      expect(receivedArgs[0]).to.be.deep.equal(expectedFirstParameter);
      expect(receivedArgs[1]).to.be.equal(fakeRefreshTokenSecret);
      expect(receivedArgs[2]).to.be.deep.equal({
        expiresIn: '7d',
      });

      done();
    });
  });

  describe('sendRefreshToken', () => {
    let fakeResponse: Response;
    let cookieSpy: SinonSpy;
    let authHelperMock: AuthHelper;

    beforeEach(() => {
      fakeResponse = {} as Response;
      fakeResponse.cookie = () => {
        return {} as Response;
      };
      cookieSpy = spy(fakeResponse, 'cookie');
      authHelperMock = new AuthHelper(createStubInstance(EmailHelper));
    });

    afterEach(() => {
      cookieSpy.restore();
    });

    it('should call "cookie" method once', (done) => {
      // Act
      authHelperMock.sendRefreshToken(fakeResponse, '', true);

      // Assert
      expect(cookieSpy.calledOnce).to.be.true;

      done();
    });

    it('should call with correct arguments', (done) => {
      // Arrange
      let expectedTokenValue = 'dummyToken';
      let expectedTokenName = 'acctkn';
      let receivedArgs: any[];

      // Act
      authHelperMock.sendRefreshToken(fakeResponse, expectedTokenValue, true);

      // Assert
      receivedArgs = cookieSpy.getCall(0).args;

      expect(receivedArgs[0]).to.be.equal(expectedTokenName);
      expect(receivedArgs[1]).to.be.equal(expectedTokenValue);

      done();
    });

    it('should set session expiration', (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      authHelperMock.sendRefreshToken(fakeResponse, 'dummyToken', true);

      // Assert
      receivedArgs = cookieSpy.getCall(0).args;

      expect(receivedArgs[2].expires).to.be.equal(undefined);

      done();
    });

    it('should set date expiration', (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      authHelperMock.sendRefreshToken(fakeResponse, 'dummyToken', false);

      // Assert
      receivedArgs = cookieSpy.getCall(0).args;

      expect(receivedArgs[2].expires).not.to.be.equal(undefined);

      done();
    });
  });

  describe('sendVerificationEmailWithJwt', () => {
    let userMock: IUser;
    let signStub: SinonStub;
    let authHelperMock: AuthHelper;

    beforeEach(() => {
      userMock = getUserMock();
      signStub = stub(jsonwebtoken, 'sign');
      authHelperMock = new AuthHelper(createStubInstance(EmailHelper));
    });

    afterEach(() => {
      signStub.restore();
    });

    describe("'Sign' calls", () => {
      it("should call 'sign' method once", (done) => {
        // Act
        authHelperMock.sendVerificationEmailWithJwt(
          userMock._id,
          userMock.email,
          faker.internet.url()
        );

        // Assert
        expect(signStub.calledOnce).to.be.true;

        done();
      });

      it("should call 'sign' method with correct arguments", (done) => {
        // Arrange
        let receivedArgs: any[];

        // Act
        authHelperMock.sendVerificationEmailWithJwt(
          userMock._id,
          userMock.email,
          faker.internet.url()
        );

        // Assert
        receivedArgs = signStub.getCall(0).args;

        expect(receivedArgs[0]).to.be.deep.equal({
          id: userMock._id,
          email: userMock.email,
        });

        expect(receivedArgs[1]).to.be.equal(fakeEmailSecret);

        done();
      });
    });

    describe("'sendVerificationEmail' calls", () => {
      let authHelperMock: AuthHelper;
      let emailHelperMock: SinonStubbedInstance<EmailHelper>;

      beforeEach(() => {
        emailHelperMock = createStubInstance(EmailHelper);
        authHelperMock = new AuthHelper(emailHelperMock);
      });

      afterEach(() => {
        emailHelperMock.sendVerificationEmail.restore();
      });

      it("should call 'sendVerificationEmail' method once", (done) => {
        // Arrange
        signStub.yields('', 'dummyToken');

        // Act
        authHelperMock.sendVerificationEmailWithJwt(
          userMock._id,
          userMock.email,
          'dummyUrl'
        );

        //Assert
        expect(emailHelperMock.sendVerificationEmail.calledOnce).to.be.true;

        done();
      });

      it("should call 'sendVerificationEmail' method with correct arguments", (done) => {
        // Arrange
        let receivedArgs: any[];
        let fakeToken = faker.random.uuid();
        let fakeUrl = faker.internet.url();

        signStub.yields('', fakeToken);

        // Act
        authHelperMock.sendVerificationEmailWithJwt(
          userMock._id,
          userMock.email,
          fakeUrl
        );
        receivedArgs = emailHelperMock.sendVerificationEmail.getCall(0).args;

        // Assert
        expect(receivedArgs[0]).to.be.equal(userMock.email);
        expect(receivedArgs[1]).to.be.equal(`${fakeUrl}/${fakeToken}`);

        done();
      });
    });
  });
});
