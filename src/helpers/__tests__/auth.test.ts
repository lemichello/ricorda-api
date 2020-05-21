import {
  createRefreshToken,
  createAccessToken,
  sendRefreshToken,
  sendVerificationEmailWithJwt,
} from '../authHelper';
import chai from 'chai';
import jwt_decode from 'jwt-decode';
import { Response } from 'express';
import { spy, stub, SinonStub, replace, SinonSpy } from 'sinon';
import faker from 'faker';
import { IUser } from '../../interfaces/IUser';
import jsonwebtoken from 'jsonwebtoken';
import config from '../../config';
import EmailHelper from '../emailHelper';

interface IRefreshToken {
  id: string;
  isSessionToken: boolean;
  tokenVersion: number;
}

interface IAccessToken {
  id: string;
}

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
  describe('createAccessToken', () => {
    let userMock: IUser;

    beforeEach(() => {
      userMock = getUserMock();
    });

    it('should have equal id', (done) => {
      // Act
      let token = createAccessToken(userMock);
      let decodedToken: IAccessToken = jwt_decode(token);

      // Assert
      expect(decodedToken.id).to.be.equal(userMock._id);

      done();
    });
  });

  describe('createRefreshToken', () => {
    let userMock: IUser;

    beforeEach(() => {
      userMock = getUserMock();
    });

    it('should create refresh token with session expiration', (done) => {
      // Act
      let token = createRefreshToken(userMock, true);
      let decodedToken: IRefreshToken = jwt_decode(token);

      // Assert
      expect(decodedToken.isSessionToken).to.be.true;

      done();
    });

    it('should have equal fields', (done) => {
      // Act
      let token = createRefreshToken(userMock, true);
      let decodedToken: IRefreshToken = jwt_decode(token);

      // Assert
      expect(decodedToken.id).to.be.equal(userMock._id);
      expect(decodedToken.tokenVersion).to.be.equal(userMock.tokenVersion);
      expect(decodedToken.isSessionToken).to.be.true;

      done();
    });
  });

  describe('sendRefreshToken', () => {
    let fakeResponse: Response;
    let cookieSpy: SinonSpy;

    beforeEach(() => {
      fakeResponse = {} as Response;
      fakeResponse.cookie = () => {
        return {} as Response;
      };
      cookieSpy = spy(fakeResponse, 'cookie');
    });

    afterEach(() => {
      cookieSpy.restore();
    });

    it('should call "cookie" method once', (done) => {
      // Act
      sendRefreshToken(fakeResponse, '', true);

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
      sendRefreshToken(fakeResponse, expectedTokenValue, true);

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
      sendRefreshToken(fakeResponse, 'dummyToken', true);

      // Assert
      receivedArgs = cookieSpy.getCall(0).args;

      expect(receivedArgs[2].expires).to.be.equal(undefined);

      done();
    });

    it('should set date expiration', (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      sendRefreshToken(fakeResponse, 'dummyToken', false);

      // Assert
      receivedArgs = cookieSpy.getCall(0).args;

      expect(receivedArgs[2].expires).not.to.be.equal(undefined);

      done();
    });
  });

  describe('sendVerificationEmailWithJwt', () => {
    let userMock: IUser;
    let signStub: SinonStub;

    beforeEach(() => {
      userMock = getUserMock();
      signStub = stub(jsonwebtoken, 'sign');
    });

    afterEach(() => {
      signStub.restore();
    });

    describe("'Sign' calls", () => {
      it("should call 'sign' method once", (done) => {
        // Act
        sendVerificationEmailWithJwt(userMock._id, userMock.email, 'dummyUrl');

        // Assert
        expect(signStub.calledOnce).to.be.true;

        done();
      });

      it("should call 'sign' method with correct arguments", (done) => {
        // Arrange
        let receivedArgs: any[];
        let fakeEmailSecret = faker.random.uuid();
        replace(config.secrets, 'emailSecret', fakeEmailSecret);

        // Act
        sendVerificationEmailWithJwt(userMock._id, userMock.email, 'dummyUrl');

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
      let sendEmailStub: SinonStub;

      beforeEach(() => {
        sendEmailStub = stub(EmailHelper, 'sendVerificationEmail');
      });

      afterEach(() => {
        sendEmailStub.restore();
      });

      it("should call 'sendVerificationEmail' method once", (done) => {
        // Arrange
        signStub.yields('', 'dummyToken');

        // Act
        sendVerificationEmailWithJwt(userMock._id, userMock.email, 'dummyUrl');

        //Assert
        expect(sendEmailStub.calledOnce).to.be.true;

        done();
      });

      it("should call 'sendVerificationEmail' method with correct arguments", (done) => {
        // Arrange
        let receivedArgs: any[];
        let fakeToken = faker.random.uuid();
        let fakeUrl = faker.internet.url();

        signStub.yields('', fakeToken);

        // Act
        sendVerificationEmailWithJwt(userMock._id, userMock.email, fakeUrl);
        receivedArgs = sendEmailStub.getCall(0).args;

        // Assert
        expect(receivedArgs[0]).to.be.equal(userMock.email);
        expect(receivedArgs[1]).to.be.equal(`${fakeUrl}/${fakeToken}`);

        done();
      });
    });
  });
});
