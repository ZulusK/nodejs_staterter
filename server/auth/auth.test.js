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
  const validUserData = {
    email: 'test.mail@gmail.com',
    password: 'lorDss98$',
    fullname: 'John Smith',
    mobileNumber: '+380500121255'
  };
  const validUserCredentials = {
    email: validUserData.email,
    password: validUserData.password
  };
  before(function (done) {
    request(app)
      .post('/api/users')
      .send(validUserData)
      .then(() => done());
  });
  describe('# POST /api/auth/login', () => {
    it('should return valid user info', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          const etaloneData = { ...validUserData };
          delete etaloneData.password;
          usefullTests.expectUser(res.body.user, etaloneData);
          done();
        })
        .catch(done);
    });
    it('should return JWT tokens', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(validUserCredentials)
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
          ...validUserCredentials,
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
          ...validUserCredentials,
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
          ...validUserCredentials,
          email: 'not-an-email@d'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
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
});
