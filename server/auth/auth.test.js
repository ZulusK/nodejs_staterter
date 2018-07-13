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
  describe('# POST /api/auth/login', testLogin);
  describe('# GET /api/auth/token', testUpdateAccessToken);
  describe('# POST /api/auth/check-access', testCheckAccessToken);
  describe('# POST /api/auth/check-refresh', testCheckRefreshToken);
  describe('# POST /api/auth/confirm-email', testConfirmEmail);
  describe('# POST /api/auth/deactivate', testEmailDeactivate);
});

function testSignup() {
  let otp = null;
  const userData = {
    mobileNumber: '+380500112836'
  };
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
  const userData = {
    mobileNumber: '+380500112836'
  };
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
  it('should return 400, use invalid ot (>4 symbols)', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp: '1234125' })
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).to.not.have.key('token');
        done();
      })
      .catch(done);
  });
  it('should return 400, use invalid ot (<4 symbols)', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp: '12' })
      .expect(httpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).to.not.have.key('token');
        done();
      })
      .catch(done);
  });
  it('should return 400, use invalid otp', (done) => {
    usefullReqs
      .makePhoneConfirmReq({ ...userData, otp: '1234' })
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

function testLogin() {
  let user = null;
  let tokens = null;

  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  before((done) => {
    clean(() => usefullReqs.createUser(userData).then((res) => {
      user = res.body.user;
      done();
    }));
  });
  after(clean);

  it('should return valid user info', (done) => {
    usefullReqs
      .makeLoginReq(userData)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        const etaloneData = { ...userData };
        delete etaloneData.password;
        usefullTests.expectUser(res.body.user, etaloneData);
        done();
      })
      .catch(done);
  });
  it('should return JWT tokens', (done) => {
    usefullReqs
      .makeLoginReq(userData)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        usefullTests.expectAuthTokens(res.body.tokens);
        tokens = res.body.tokens;
        done();
      })
      .catch(done);
  });
  it('should not fail, verify access token', (done) => {
    usefullTests.expectAccessTokenIsValid(app, tokens.access.token, done);
  });
  it('should not fail, verify refresh token', (done) => {
    usefullTests.expectRefreshTokenIsValid(app, tokens.refresh.token, done);
  });
  it('should return 401, no such user', (done) => {
    usefullReqs
      .makeLoginReq({
        ...userData,
        password: 'aaaaWer$ty124'
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        expect(res.body.message).to.equal('Authentication error');
        done();
      })
      .catch(done);
  });
}

function testUpdateAccessToken() {
  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  let tokens = null;
  before((done) => {
    clean(() => usefullReqs.createAndLoginUser(userData).then((res) => {
      tokens = res.tokens;
      done();
    }));
  });
  after(clean);

  describe('# Get /api/auth/token', () => {
    it('should return JWT token', (done) => {
      usefullReqs
        .makeUpdateAccessTokenReq(tokens.refresh.token)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          usefullTests.expectAccessJWTToken(res.body);
          tokens.access = res.body;
          done();
        })
        .catch(done);
    });
    it('should not fail, verify new access token', (done) => {
      usefullTests.expectAccessTokenIsValid(app, tokens.access.token, done);
    });
    it('should reject, used invalid token', (done) => {
      usefullReqs
        .makeUpdateAccessTokenReq('bearer not-a-token-at-all')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  });
}

function testCheckAccessToken() {
  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  let tokens = null;
  before((done) => {
    clean(() => usefullReqs.createAndLoginUser(userData).then((res) => {
      tokens = res.tokens;
      done();
    }));
  });
  beforeEach((done) => {
    usefullReqs
      .makeLoginReq(userData)
      .then((res) => {
        tokens = res.body.tokens;
        done();
      })
      .catch(done);
  });
  after(clean);
  it('should not reject, used valid token', (done) => {
    request(app)
      .get('/api/auth/check-access')
      .set('Authorization', `bearer ${tokens.access.token}`)
      .expect(httpStatus.OK)
      .then((res) => {
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid token', (done) => {
    request(app)
      .get('/api/auth/check-access')
      .set('Authorization', 'bearer invalid.Token.here')
      .expect(httpStatus.UNAUTHORIZED)
      .then((res) => {
        done();
      })
      .catch(done);
  });
  it('should reject, used outdated token', (done) => {
    setTimeout(function () {
      request(app)
        .get('/api/auth/check-access')
        .set('Authorization', `bearer ${tokens.access.token}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          done();
        })
        .catch(done);
    }, tokens.access.expiredIn * 1000 - Date.now());
  });
}

function testCheckRefreshToken() {
  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  let tokens = null;
  before((done) => {
    clean(() => usefullReqs.createAndLoginUser(userData).then((res) => {
      tokens = res.tokens;
      done();
    }));
  });
  beforeEach((done) => {
    usefullReqs
      .makeLoginReq(userData)
      .then((res) => {
        tokens = res.body.tokens;
        done();
      })
      .catch(done);
  });
  after(clean);
  it('should not reject, used valid token', (done) => {
    request(app)
      .get('/api/auth/check-refresh')
      .set('Authorization', `bearer ${tokens.refresh.token}`)
      .expect(httpStatus.OK)
      .then((res) => {
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid token', (done) => {
    request(app)
      .get('/api/auth/check-refresh')
      .set('Authorization', 'bearer invalid.Token.here')
      .expect(httpStatus.UNAUTHORIZED)
      .then((res) => {
        done();
      })
      .catch(done);
  });
  it('should reject, used outdated token', (done) => {
    setTimeout(function () {
      request(app)
        .get('/api/auth/check-refresh')
        .set('Authorization', `bearer ${tokens.refresh.token}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          done();
        })
        .catch(done);
    }, tokens.refresh.expiredIn * 1000 - Date.now());
  });
}

function testConfirmEmail() {
  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  let activationEmailToken = null;
  before((done) => {
    clean(() => usefullReqs.createUser(userData).then((res) => {
      activationEmailToken = res.body.token;
      done();
    }));
  });
  after(clean);
  it('should return 200, email is not activated', (done) => {
    usefullReqs
      .activateUserEmail(activationEmailToken)
      .then(res => expect(res.status).to.be.eq(httpStatus.OK))
      .then(() => done())
      .catch(done);
  });
  it('should reject, email is activated', (done) => {
    usefullReqs
      .activateUserEmail(activationEmailToken)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid token', (done) => {
    request(app)
      .post('/api/auth/confirm-email')
      .set('Authorization', 'bearer invalid.token.here')
      .expect(httpStatus.UNAUTHORIZED)
      .then(() => done())
      .catch(done);
  });
}

function testEmailDeactivate() {
  const userData = {
    mobileNumber: '+380500112836',
    email: 'sample.mail@mail.com',
    fullname: 'John Stark',
    password: '123Asd@dmvc7'
  };
  let activationEmailToken = null;
  before((done) => {
    clean(() => usefullReqs.createUser(userData).then((res) => {
      activationEmailToken = res.body.token;
      done();
    }));
  });
  after(clean);
  it('should return 200, email is not activated', (done) => {
    usefullReqs
      .deactivateUserEmail(activationEmailToken)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        done();
      })
      .catch(done);
  });
  it('should reject, email is activated', (done) => {
    usefullReqs
      .deactivateUserEmail(activationEmailToken)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      })
      .catch(done);
  });
  it('should reject, use invalid token', (done) => {
    usefullReqs
      .deactivateUserEmail("invalid-token")
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
}
