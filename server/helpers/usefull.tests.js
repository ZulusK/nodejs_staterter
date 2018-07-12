require('module-alias/register');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const config = require('@config/config');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');

const expectUser = (user, etaloneFields = {}) => {
  expect(user).to.be.an('object');
  expect(user).to.include.all.keys([
    'id',
    'fullname',
    'createdAt',
    'updatedAt',
    'email',
    'mobileNumber'
  ]);
  Object.keys(etaloneFields).forEach((key) => {
    expect(user[key]).to.be.equal(etaloneFields[key]);
  });
};

const expectStop = (stop) => {
  expect(stop).to.include.all.keys(['name', 'location', 'id']);
  expect(stop.name).to.be.a('string');
  expect(stop.location).to.have.all.keys(['latitude', 'longitude']);
  expect(stop.location.latitude).to.be.a('number');
  expect(stop.location.longitude).to.be.a('number');
};

const expectAccessJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.most(Math.floor(Date.now() / 1000) + config.jwtExpAccess);
  expect(token.expiredIn).to.be.gt(Math.floor(Date.now() / 1000));
};

const expectRefreshJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.least(Math.floor(Date.now() / 1000) + config.jwtExpRefresh);
  expect(token.expiredIn).to.be.gt(Math.floor(Date.now() / 1000));
};
const expectAuthTokens = (tokens) => {
  expect(tokens).to.be.an('object');
  expect(tokens).have.all.keys(['access', 'refresh']);
  expectAccessJWTToken(tokens.access);
  expectRefreshJWTToken(tokens.refresh);
};

// try to connect to server using JWT token
const expectTokenIsValid = (url, app, token, done) => {
  request(app)
    .get(url)
    .set('Authorization', `bearer ${token}`)
    .expect(httpStatus.OK)
    .then(() => {
      done();
    })
    .catch(done);
};

// check access token is not outdated
const expectAccessTokenIsValid = (app, token, done) => expectTokenIsValid('/api/auth/check-access', app, token, done);
// check refresh token is not outdated
const expectRefreshTokenIsValid = (app, token, done) => expectTokenIsValid('/api/auth/check-refresh', app, token, done);

module.exports = {
  expectRefreshTokenIsValid,
  expectAccessTokenIsValid,
  expectTokenIsValid,
  expectAccessJWTToken,
  expectRefreshJWTToken,
  expectAuthTokens,
  expectUser,
  expectStop
};
