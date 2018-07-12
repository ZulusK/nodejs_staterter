require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Route = require('@server/route/route.model');
const usefullTests = require('@helpers/usefull.tests');
const filler = require('@helpers/dbFiller');
const { ObjectId } = require('mongoose').Types;

chai.config.includeStack = true;

describe('## Route APIs', () => {
  let routes = [];
  before((done) => {
    filler
      .fillAllDBs()
      .then(() => Route.find({}).exec())
      .then((savedRoutes) => {
        routes = savedRoutes;
        done();
      })
      .catch(done);
  });
  after((done) => {
    filler
      .clear()
      .then(() => done())
      .catch(done);
  });
  describe('# Get /api/routes/:routeId', () => {
    it('should return valid route info', (done) => {
      request(app)
        .get(`/api/routes/${routes[0]._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          usefullTests.expectRoute(res.body, true);
          done();
        })
        .catch(done);
    });
    it('should reject, used not-existing id', (done) => {
      request(app)
        .get(`/api/routes/${ObjectId()}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid id', (done) => {
      request(app)
        .get('/api/routes/wdnd2lkln@')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
  describe('# Get /api/routes', () => {
    it('should return valid routes info, wth query', (done) => {
      request(app)
        .get('/api/routes/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(routes.length);
          res.body.forEach(s => usefullTests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return valid routes info, limit=2', (done) => {
      const limit = 2;
      request(app)
        .get(`/api/routes?limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(limit);
          res.body.forEach(s => usefullTests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return valid routes info, skip=2', (done) => {
      const skip = 2;
      request(app)
        .get(`/api/routes?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(routes.length - skip);
          res.body.forEach(s => usefullTests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return valid routes info, skip=20, limit=4', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(limit);
          res.body.forEach(s => usefullTests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = 100;
      request(app)
        .get(`/api/routes?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.empty;
          done();
        })
        .catch(done);
    });
    it('should return valid routes, wth skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.not.empty;
          done();
        })
        .catch(done);
    });
  });
});
