require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const User = require('@server/user/user.model');
const usefullTests = require('@helpers/usefull.tests');

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  let tokens = null;

  const validUserDataActivated = {
    email: 'test.mail@gmail.com',
    password: 'lorDss98$',
    fullname: 'John Smith',
    mobileNumber: '+380500121255'
  };
  const validUserDataNotActivated = {
    email: 'test.mail@mail.com',
    password: 'lorDss98$',
    fullname: 'John Smith',
    mobileNumber: '+380500121255'
  };
  before(function (done) {
    Promise.all([
      // add activated user
      request(app)
        .post('/api/users')
        .send(validUserDataActivated)
        .then(() => User.findOne({ email: validUserDataActivated.email }).exec())
        .then(user => user.update({ isEmailConfirmed: true }).exec()), // activate account by hend
      // add not activated user
      request(app)
        .post('/api/users')
        .send(validUserDataNotActivated)
    ])
      .then(() => done())
      .catch(done);
  });

  describe('# POST /api/auth/login', () => {
    describe('user activated', () => {
      it('should return valid user info', (done) => {
        request(app)
          .post('/api/auth/login')
          .send(validUserDataActivated)
          .expect(httpStatus.OK)
          .then((res) => {
            const etaloneData = { ...validUserDataActivated };
            delete etaloneData.password;
            usefullTests.expectUser(res.body.user, etaloneData);
            done();
          })
          .catch(done);
      });
      it('should return JWT tokens', (done) => {
        request(app)
          .post('/api/auth/login')
          .send(validUserDataActivated)
          .expect(httpStatus.OK)
          .then((res) => {
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
      it('should return Authentication error', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataActivated,
            password: 'aaaaWer$ty124'
          })
          .expect(httpStatus.UNAUTHORIZED)
          .then((res) => {
            expect(res.body.message).to.equal('Authentication error');
            done();
          })
          .catch(done);
      });
      it('should return Bad Request error (invalid password)', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataActivated,
            password: 'aaaaWerty12'
          })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            done();
          })
          .catch(done);
      });
      it('should return Bad Request error (invalid email)', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataActivated,
            email: 'not-an-email@d'
          })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            done();
          })
          .catch(done);
      });
    });
    describe('user is not activated', () => {
      it('should return valid user info', (done) => {
        request(app)
          .post('/api/auth/login')
          .send(validUserDataNotActivated)
          .expect(httpStatus.UNAUTHORIZED)
          .then((res) => {
            done();
          })
          .catch(done);
      });
      it('should return Authentication error', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataNotActivated,
            password: 'aaaaWer$ty124'
          })
          .expect(httpStatus.UNAUTHORIZED)
          .then((res) => {
            expect(res.body.message).to.equal('Authentication error');
            done();
          })
          .catch(done);
      });
      it('should return Bad Request error (invalid password)', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataNotActivated,
            password: 'aaaaWerty12'
          })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            done();
          })
          .catch(done);
      });
      it('should return Bad Request error (invalid email)', (done) => {
        request(app)
          .post('/api/auth/login')
          .send({
            ...validUserDataNotActivated,
            email: 'not-an-email@d'
          })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            done();
          })
          .catch(done);
      });
    });
  });
  describe('# Get /api/auth/token', () => {
    it('should return JWT token', (done) => {
      request(app)
        .get('/api/auth/token')
        .set('Authorization', `bearer ${tokens.refresh.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
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
      request(app)
        .get('/api/auth/token')
        .set('Authorization', 'bearer not-a-token-at-all')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
  describe('# Post /api/auth/check-access', () => {
    beforeEach(function (done) {
      request(app)
        .post('/api/auth/login')
        .send(validUserDataActivated)
        .then((res) => {
          tokens = res.body.tokens;
          done();
        })
        .catch(done);
    });
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
      }, tokens.access.expiredIn * 1000 - Date.now() + 1000);
    });
  });
  describe('# Post /api/auth/check-refresh', () => {
    beforeEach(function (done) {
      request(app)
        .post('/api/auth/login')
        .send(validUserDataActivated)
        .then((res) => {
          tokens = res.body.tokens;
          done();
        })
        .catch(done);
    });
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
      }, tokens.refresh.expiredIn * 1000 - Date.now() + 1000);
    });
  });
});
