require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const User = require('@server/user/user.model');
const usefullTests = require('@helpers/usefull.tests');

chai.config.includeStack = true;

describe('## User APIs', () => {
  const validUserData = {
    email: 'test@gmail.com',
    password: 'lordss98',
    fullname: 'John Smith',
    mobileNumber: '+380500121255'
  };
  const tokens = null;
  beforeEach(function (done) {
    User.remove({})
      .exec()
      .then(() => done())
      .catch(done);
  });
  describe('# POST /api/user', () => {
    it('should return valid user info', (done) => {
      request(app)
        .post('/api/users')
        .send(validUserData)
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
        .post('/api/users')
        .send(validUserData)
        .expect(httpStatus.OK)
        .then((res) => {
          usefullTests.expectAuthTokens(res.body.tokens);
          done();
        })
        .catch(done);
    });
  });
});
