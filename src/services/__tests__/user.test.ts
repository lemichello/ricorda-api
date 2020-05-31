import chai from 'chai';
import { IUserService } from '../interfaces/IUserService';
import UserService from '../userService';
import { createStubInstance, stub, SinonStub } from 'sinon';
import faker from 'faker';
import userModel, { IUserModel } from '../../models/userModel';
import { IServiceResponse } from '../../interfaces/IServiceResponse';

let expect = chai.expect;

describe('UserService', () => {
  let userServiceMock: IUserService;
  let fakeUserModel: SinonStub;

  beforeEach(() => {
    fakeUserModel = stub(userModel, 'findById');
    fakeUserModel.returns({
      exec: () => {},
    });

    userServiceMock = new UserService(userModel);
  });

  afterEach(() => {
    fakeUserModel.restore();
  });

  describe('GetUserById', () => {
    it("should call 'findById' once", (done) => {
      // Arrange
      let fakeUserId = faker.random.uuid();

      // Act
      userServiceMock.GetUserById(fakeUserId);

      // Assert
      expect(fakeUserModel.calledOnce).to.be.true;

      done();
    });

    it("should call 'findById' with correct arguments", (done) => {
      // Arrange
      let fakeUserId = faker.random.uuid();

      // Act
      userServiceMock.GetUserById(fakeUserId);

      // Assert
      expect(fakeUserModel.calledWith(fakeUserId)).to.be.true;

      done();
    });

    it('should return result with user', (done) => {
      // Arrange
      let fakeUserId = faker.random.uuid();
      const expectedResult = {
        _id: faker.random.uuid(),
      };
      fakeUserModel.returns({
        exec: () => expectedResult,
      });

      // Act
      userServiceMock.GetUserById(fakeUserId).then(({ error, payload }) => {
        // Assert
        expect(error).to.be.null;
        expect(payload).to.be.deep.equal(expectedResult);

        done();
      });
    });

    it('should return result with error', (done) => {
      // Arrange
      let fakeUserId = faker.random.uuid();
      const expectedResult = {
        _id: faker.random.uuid(),
      };
      fakeUserModel.throws('Dummy error');

      // Act
      userServiceMock.GetUserById(fakeUserId).then(({ error, payload }) => {
        // Assert
        expect(error).to.be.not.null;
        expect(payload).to.be.null;

        done();
      });
    });
  });
});
