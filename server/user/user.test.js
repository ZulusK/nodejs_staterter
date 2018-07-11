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
    email: 'test.mail@gmail.com',
    password: 'lorDss98$',
    fullname: 'John Smith',
    mobileNumber: '+380500121255'
  };
  beforeEach(function (done) {
    User.remove({})
      .exec()
      .then(() => done())
      .catch(done);
  });
  const tokens = null;
  describe('# POST /api/user', () => {
    it('should return status 200', (done) => {
      request(app)
        .post('/api/users')
        .send(validUserData)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.all.keys(['message']);
          expect(res.body.message).to.be.eq('Check your email');
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid email', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          email: 'invalid@m'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used already existed email', (done) => {
      // create new user
      request(app)
        .post('/api/users')
        .send({ ...validUserData })
        .then(() => {
          request(app)
            .post('/api/users')
            .send({
              ...validUserData
            })
            .expect(httpStatus.BAD_REQUEST)
            .then((res) => {
              done();
            });
        })
        .catch(done);
    });
    it('should reject, used invalid password ( < 8 symbols)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          password: 'a2!34'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid password ( > 20 symbols)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          password: 'a234asakIHIBS!Ibi2i7iaih87xaixjni'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid password (without uppercase symbols)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          password: 'asfsisib2bk23k2k'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid password (without lowercase symbols)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          password: 'ADLNLWNOWN23!'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid password (without special symbols)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          password: 'ADLassd23'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid mobileNumber (not a number)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          mobileNumber: 'ADLassd23'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid mobileNumber (bad )', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          mobileNumber: 'ADLassd23'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should not reject, used mobileNumber without country code', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          mobileNumber: '0500715577'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should not reject, used mobileNumber without country code and first zero', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          mobileNumber: '500715577'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should not reject, used invalid fullname (used digits)', (done) => {
      request(app)
        .post('/api/users')
        .send({
          ...validUserData,
          fullname: 'Joe2'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
});
