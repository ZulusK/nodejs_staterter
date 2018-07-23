require('module-alias/register');
const request = require('supertest-as-promised');
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

function createUser(userData) {
  return createPendingUser(userData).then(phoneActivationToken => makeUserCreateReq({ userData, phoneActivationToken })); // eslint-disable-line max-len
}

function makeLoginReq(userData) {
  return request(app)
    .post('/api/auth/login')
    .auth(userData.email, userData.password);
}
function createAndLoginUser(userData) {
  return createPendingUser(userData)
    .then(phoneActivationToken => makeUserCreateReq({ userData, phoneActivationToken }))
    .then(res => res.body);
}
function makeUpdateAccessTokenReq(refreshToken) {
  return request(app)
    .get('/api/auth/token')
    .set('Authorization', `bearer ${refreshToken}`);
}

function activateUserEmail(activationEmailToken) {
  return request(app)
    .post('/api/auth/confirm-email')
    .set('Authorization', `bearer ${activationEmailToken}`);
}

function deactivateUserEmail(deactivationEmailToken) {
  return request(app)
    .post('/api/auth/deactivate-email')
    .set('Authorization', `bearer ${deactivationEmailToken}`);
}
module.exports = {
  createAndLoginUser,
  deactivateUserEmail,
  activateUserEmail,
  makeUpdateAccessTokenReq,
  makeLoginReq,
  makeUserCreateReq,
  makePhoneConfirmReq,
  makeSignupReq,
  createPendingUser,
  createUser
};
