require('module-alias/register');

const _ = require('lodash');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const User = require('@/user/user.model');
const PendingUser = require('@/pendingUser/pendingUser.model');
const dbFiller = require('@helpers/dbFiller');
const reqs = require('@tests/reqs');
const tests = require('@tests/tests');
const config = require('@config/config');

chai.config.includeStack = true;

function clean(done) {
  dbFiller
    .clear()
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
  mobileNumber: '+380500121255',
  creditCardNumber: '4111111111111111',
  creditCardCVV: '456',
  creditCardExpDate: '11/19'
};

function testUserCreation() {
  after(clean);
  let phoneActivationToken = null;
  beforeEach((done) => {
    clean(() => reqs.createPendingUser(userData).then((token) => {
      phoneActivationToken = token;
      done();
    }));
  });
  after(clean);

  it('should return valid user info', (done) => {
    reqs
      .makeUserCreateReq({ userData, phoneActivationToken })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        const etaloneData = { ...userData };
        delete etaloneData.password;
        delete etaloneData.creditCardNumber;
        delete etaloneData.creditCardCVV;
        delete etaloneData.creditCardExpDate;
        tests.expectUser(res.body.user, etaloneData);
        done();
      })
      .catch(done);
  });
  it('should return JWT tokens', (done) => {
    reqs
      .makeUserCreateReq({ userData, phoneActivationToken })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        tests.expectAuthTokens(res.body.tokens);
        done();
      })
      .catch(done);
  });
  it('should not fail, verify access token', (done) => {
    reqs
      .makeUserCreateReq({ userData, phoneActivationToken })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        tests.expectAccessTokenIsValid(app, res.body.tokens.access.token, done);
      })
      .catch(done);
  });
  it('should not fail, verify refresh token', (done) => {
    reqs
      .makeUserCreateReq({ userData, phoneActivationToken })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        tests.expectRefreshTokenIsValid(app, res.body.tokens.refresh.token, done);
      })
      .catch(done);
  });
  it('should reject, use invalid email', (done) => {
    reqs
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
  it('should reject, use invalid phone activation token', (done) => {
    reqs
      .makeUserCreateReq({
        userData,
        phoneActivationToken: '123456'
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
  it('should reject, use empty phone activation token', (done) => {
    reqs
      .makeUserCreateReq({
        userData
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
  it('should reject, use already existed email', (done) => {
    reqs
      .makeUserCreateReq({
        userData,
        phoneActivationToken
      })
      .then(() => reqs.makeUserCreateReq({
        userData,
        phoneActivationToken
      }))
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      })
      .catch(done);
  });
  it('should reject, use invalid password ( < 8 symbols)', (done) => {
    reqs
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
  it('should reject, use invalid password ( > 20 symbols)', (done) => {
    reqs
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
  it('should reject, use invalid password (without uppercase symbols)', (done) => {
    reqs
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
  it('should reject, use invalid password (without lowercase symbols)', (done) => {
    reqs
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
  it('should reject, use invalid password (without special symbols)', (done) => {
    reqs
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
  it('should not reject, use invalid fullname (use digits)', (done) => {
    reqs
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
  it('should reject, use invalid creditCardNumber (<15 symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardNumber: '411111111111'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardNumber (>15 symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardNumber: '41111111111112341234'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardNumber (invalid symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardNumber: '41111111111111A1'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardCVV (<3 symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardCVV: '12'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardCVV (>3 symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardCVV: '4555'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardCVV (invalid symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardCVV: '45a'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardExpDate (invalid symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardExpDate: '45a'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardExpDate (too match symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardExpDate: '1230303'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
  it('should reject, use invalid creditCardExpDate (too less symbols)', (done) => {
    reqs
      .makeUserCreateReq({
        userData: {
          ...userData,
          creditCardExpDate: '12'
        },
        phoneActivationToken
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
        done();
      });
  });
}
