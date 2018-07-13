require('module-alias/register');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
// const config = require('@config/config');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');

const expectUser = (user, etaloneFields = {}) => {
  expect(user).to.be.an('object');
  expect(user).to.include.keys('_id', 'fullname', 'email', 'mobileNumber');
  expect(user).to.not.include.keys('password');
  Object.keys(etaloneFields).forEach((key) => {
    expect(user[key]).to.be.equal(etaloneFields[key]);
  });
};

const expectStop = (stop) => {
  expect(stop).to.include.keys('name', 'location', '_id');
  expect(stop.name).to.be.a('string');
  expect(stop.location.coordinates)
    .to.be.an('array')
    .with.length(2);
  expect(stop.location.coordinates[0]).all.be.an('number');
  expect(stop.location.coordinates[1]).all.be.an('number');
};

const expectAccessJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.least(Math.floor(Date.now() / 1000));
};

const expectRefreshJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.least(Math.floor(Date.now() / 1000));
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

const expectRoute = (route, isFull = false) => {
  expect(route).to.be.an('object');
  expect(route).to.include.keys(
    'name',
    '_id',
    'origin',
    'destination',
    'color',
    'distance',
    'estimatedTime',
    'waypoints'
  );
  expect(route.name).to.be.a('string');
  expect(route._id).to.be.a('string');
  expect(route.color).to.be.a('string');
  expect(route.distance).to.be.a('string');
  expect(route.estimatedTime).to.be.a('string');
  if (isFull) {
    expectStop(route.origin);
    expectStop(route.destination);
    route.waypoints.forEach(w => expectStop(w));
  } else {
    expect(route.origin).to.be.a('string');
    expect(route.waypoints).to.be.an('array');
    expect(route.destination).to.be.a('string');
    route.waypoints.forEach(s => expect(s).to.be.an('string'));
  }
};
const expectBus = (bus, isFull = false) => {
  expect(bus).to.be.an('object');
  // console.log(bus);
  expect(bus).to.include.keys('name', '_id', 'seatsCount');
  expect(bus.name).to.be.a('string');
  expect(bus._id).to.be.a('string');
  expect(bus.seatsCount).to.be.a('number');
  if (bus.location) {
    expect(bus.location.coordinates)
      .to.be.an('array')
      .with.length(2);
    expect(bus.location.coordinates[0]).all.be.an('number');
    expect(bus.location.coordinates[1]).all.be.an('number');
  }
  if (isFull) {
    if (bus.route) expectRoute(bus.route);
  } else if (bus.route) expect(bus.route).to.be.a('string');
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
  expectRoute,
  expectStop,
  expectBus
};
