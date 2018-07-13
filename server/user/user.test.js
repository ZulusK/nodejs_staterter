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

describe('## User APIs', () => {
  describe('POST /api/user', testUserCreation);
});

const userData = {
  email: 'test.mail@gmail.com',
  password: 'lorDss98$',
  fullname: 'John Smith',
  mobileNumber: '+380500121255'
};

function testUserCreation() {
  let phoneActivationToken = null;
  let tokens = null;
  beforeEach((done) => {
    clean(() => usefullReqs.createPendingUser(userData).then((token) => {
      phoneActivationToken = token;
      done();
    }));
  });
  after(clean);

  it('should return valid user info', (done) => {
    usefullReqs
      .makeUserCreateReq({ userData, phoneActivationToken })
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
      .makeUserCreateReq({ userData, phoneActivationToken })
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
  it('should reject, used invalid email', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          email: 'invalid@m'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      })
      .catch(done);
  });
  it('should reject, used already existed email', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData,
        phoneActivationToken
      })
      .then(() => usefullReqs.makeUserCreateReq({
        userData,
        phoneActivationToken
      }))
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid password ( < 8 symbols)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          password: 'a2!34'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, used invalid password ( > 20 symbols)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          password: 'a234asakIHIBS!Ibi2i7iaih87xaixjni'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, used invalid password (without uppercase symbols)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          password: 'asfsisib2b@k23k2k'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, used invalid password (without lowercase symbols)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          password: 'ADLNLWNOWN23!'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, used invalid password (without special symbols)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          password: 'ADLassd23'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });

  it('should not reject, used invalid fullname (used digits)', (done) => {
    usefullReqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          fullname: 'Joe2'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
}
