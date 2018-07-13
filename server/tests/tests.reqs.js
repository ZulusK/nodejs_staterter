require('module-alias/register');
// const chai = require('chai'); // eslint-disable-line import/newline-after-import
// const config = require('@config/config');
const request = require('supertest-as-promised');
// const httpStatus = require('http-status');
const app = require('@app');

function makeSignupReq(data) {
  return request(app)
    .post('/api/auth/signup')
    .send(data);
}
function makePhoneConfirmReq(data) {
  return request(app)
    .post('/api/auth/confirm-phone')
    .send(data);
}

function createPendingUser(data) {
  return makeSignupReq(data)
    .then(res => makePhoneConfirmReq({ ...data, otp: res.body.otp }))
    .then(res => res.body.token);
}

function makeUserCreateReq({ userData, phoneActivationToken }) {
  return request(app)
    .post('/api/users')
    .set('Authorization', `bearer ${phoneActivationToken}`)
    .send(userData);
}
module.exports = {
  makeUserCreateReq,
  makePhoneConfirmReq,
  makeSignupReq,
  createPendingUser
};
