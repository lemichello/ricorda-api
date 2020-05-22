import chai from 'chai';
import { stub, SinonStub } from 'sinon';
import transporter from '../../transporter';
import EmailHelper from '../emailHelper';
import faker from 'faker';

let expect = chai.expect;

describe('EmailHelper', () => {
  describe('sendVerificationEmail', () => {
    let transporterStub: SinonStub;
    let fakeEmail: string;
    let fakeUrl: string;
    let emailHelperMock: EmailHelper;

    beforeEach(() => {
      transporterStub = stub(transporter, 'sendMail');
      fakeEmail = faker.internet.email();
      fakeUrl = faker.internet.url();
      emailHelperMock = new EmailHelper();
    });

    afterEach(() => {
      transporterStub.restore();
    });

    it('should call transporter once', (done) => {
      // Act
      emailHelperMock.sendVerificationEmail(fakeEmail, fakeUrl);

      // Assert
      expect(transporterStub.calledOnce).to.be.true;

      done();
    });

    it('should call transporter with correct arguments', (done) => {
      // Arrange
      let receivedArgs: any[];

      // Act
      emailHelperMock.sendVerificationEmail(fakeEmail, fakeUrl);
      receivedArgs = transporterStub.getCall(0).args;

      // Assert
      expect(receivedArgs[0].to).to.be.equal(fakeEmail);
      expect(receivedArgs[0].html).to.contain(`href="${fakeUrl}"`);

      done();
    });
  });
});
