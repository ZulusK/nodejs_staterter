require('module-alias/register');

const _ = require('lodash');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const User = require('@server/user/user.model');
const PendingUser = require('@server/pendingUser/pendingUser.model');
const usefullReqs = require('@tests/tests.reqs');
const usefullTests = require('@tests/tests.tests');
const config = require('@config/config');

chai.config.includeStack = true;

function clean(done) {
  Promise.all([User.remove().exec(), PendingUser.remove().exec()])
    .then(() => done())
    .catch(done);
}
describe('## Auth APIs', () => {
  describe('# POST /api/auth/signup', testSignup);
  describe('# POST /api/auth/confirm-phone', testConfirmPhone);
});

const userData = {
  mobileNumber: '+380500112836'
};
function testSignup() {
  let otp = null;
  before(clean);
  after(clean);

  it('should return 200, use new user', (done) => {
    usefullReqs
      .makeSignupReq(userData)
      .expect(httpStatus.OK)
      .then(res => PendingUser.findOne(userData))
      .then((createdPendingUser) => {
        otp = createdPendingUser.otp;
        expect(createdPendingUser.otp).to.have.length(config.otpLen);
        expect(createdPendingUser.mobileNumber).to.be.eq(userData.mobileNumber);
        expect(createdPendingUser.timeOfMessageSending).to.have.length(1);
        done();
      })
      .catch(done);
  });
  it('should return 200, use existing, not activated user', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq(userData)
        .expect(httpStatus.OK)
        .then(res => PendingUser.findOne(userData))
        .then((existingPendingUser) => {
          expect(existingPendingUser.otp).to.be.not.eq(otp);
          otp = existingPendingUser.otp;
          expect(existingPendingUser.mobileNumber).to.be.eq(userData.mobileNumber);
          expect(existingPendingUser.timeOfMessageSending).to.have.length(2);
          done();
        })
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 400, do not wait', (done) => {
    usefullReqs
      .makeSignupReq(userData)
      .expect(httpStatus.BAD_REQUEST)
      .then(res => PendingUser.findOne(userData))
      .then((existingPendingUser) => {
        expect(existingPendingUser.otp).to.be.eq(otp);
        expect(existingPendingUser.mobileNumber).to.be.eq(userData.mobileNumber);
        expect(existingPendingUser.timeOfMessageSending).to.have.length(2);
        done();
      })
      .catch(done);
  });
  it('should return 400, use all OTP generation per one hour', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq(userData)
        .expect(httpStatus.BAD_REQUEST)
        .then(() => PendingUser.findOne(userData))
        .then((existingPendingUser) => {
          expect(existingPendingUser.otp).to.be.eq(otp);
          expect(existingPendingUser.mobileNumber).to.be.eq(userData.mobileNumber);
          expect(existingPendingUser.timeOfMessageSending).to.have.length(config.smsLimitPerHour);
          done();
        })
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 400, use empty post body', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({})
        .expect(httpStatus.BAD_REQUEST)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 400, use invalid mobileNumber (not a number)', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({ mobileNumber: '+38012845s' })
        .expect(httpStatus.BAD_REQUEST)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 400, use invalid mobileNumber (invalid country code)', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({ mobileNumber: '+1 606-268-8220' })
        .expect(httpStatus.BAD_REQUEST)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 400, use mobileNumber "+yy xxx xxx xxxx"', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({ mobileNumber: '+38 606 268 8220' })
        .expect(httpStatus.BAD_REQUEST)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 200, use mobileNumber "xxx-xxx-xxxx"', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({ mobileNumber: '050-268-8220' })
        .expect(httpStatus.OK)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
  it('should return 200, use mobileNumber "xxxxxxxxxx"', (done) => {
    setTimeout(function () {
      usefullReqs
        .makeSignupReq({ mobileNumber: '0500719832' })
        .expect(httpStatus.OK)
        .then(() => done())
        .catch(done);
    }, config.smsTimeout);
  });
}
function testConfirmPhone() {
  let otp = null;
  beforeEach((done) => {
    clean(() => usefullReqs
      .makeSignupReq(userData)
      .then(() => PendingUser.findOne(userData))
      .then((createdUser) => {
        otp = createdUser.otp;
        done();
      })
      .catch(done));
  });

  after(clean);
  it('should return 200, use valid otp', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp })
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body.token).to.be.a('string');
        done();
      })
      .catch(done);
  });
  it('should return 400, use invalid otp', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp: '12345' })
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).to.not.have.key('token');
        done();
      })
      .catch(done);
  });
  it('should return 400, use otp after timeout', (done) => {
    setTimeout(function () {
      usefullReqs
        .makePhoneConfirmReq({ ...userData, otp })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body).to.not.have.key('token');
          done();
        })
        .catch(done);
    }, config.smsTimeout * 2);
  });
  it('should return 200, use used otp', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp })
      .then(() => usefullReqs.makePhoneConfirmReq({ ...userData, otp }))
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expect(res.body.token).to.be.a('string');
        done();
      })
      .catch(done);
  });
}
