require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Route = require('@/route/route.model');
const Bus = require('@/bus/bus.model');
const reqs = require('@tests/reqs');
const tests = require('@tests/tests');
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
    let routeId = null;
    before((done) => {
      routeId = routes[0]._id;
      done();
    });
    it('should return valid route info', (done) => {
      request(app)
        .get(`/api/routes/${routeId}`)
        .expect(httpStatus.OK)
        .then((res) => {
          tests.expectRoute(res.body, true);
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
    it('should return valid routes info, without query', (done) => {
      request(app)
        .get('/api/routes/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(routes.length);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectRoute(s));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(limit);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.of.at.most(limit);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectRoute(s));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(routes.length - skip);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return valid routes info, skip=1, limit=4', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectRoute(s));
          done();
        })
        .catch(done);
    });
    it('should return valid routes full info, skip=1, limit=4, populate=true', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}&populate=true`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectRoute(s, true));
          done();
        })
        .catch(done);
    });
    it('should return valid routes full info, skip=1, limit=4, populate=invalid', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}&populate=invalid`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectRoute(s, true));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          expect(res.body.total).to.be.eq(routes.length);
          expect(res.body.offset).to.of.eq(skip);
          done();
        })
        .catch(done);
    });
    it('should return valid routes, without skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/routes?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          done();
        })
        .catch(done);
    });
  });
  describe('# Get /api/routes/:routeId/buses', () => {
    let routeId = null;
    let buses = [];

    before((done) => {
      routeId = routes[0]._id;
      Bus.listByRoute(routeId)
        .then((result) => {
          buses = result.docs;
          done();
        })
        .catch(done);
    });
    it('should return valid buses info', (done) => {
      request(app)
        .get(`/api/routes/${routeId}/buses`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(buses.length);
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should reject, used not-existing id', (done) => {
      request(app)
        .get(`/api/routes/${ObjectId()}/buses`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid id', (done) => {
      request(app)
        .get('/api/routes/wdnd2lkln@/buses')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should return valid buses info, skip=2', (done) => {
      const skip = 2;
      request(app)
        .get(`/api/routes/${routeId}/buses?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(buses.length - skip);
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return valid buses info, skip=1, limit=2', (done) => {
      const skip = 1;
      const limit = 2;
      request(app)
        .get(`/api/routes/${routeId}/buses?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.at.least(Math.min(limit, buses.length));
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = 100;
      request(app)
        .get(`/api/routes/${routeId}/buses?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.offset).to.of.eq(skip);
          done();
        })
        .catch(done);
    });
    it('should return valid buses, without skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/routes/${routeId}/buses?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          done();
        })
        .catch(done);
    });
    it('should return valid buses full info, skip=1, limit=2, populate=true', (done) => {
      const skip = 1;
      const limit = 2;
      request(app)
        .get(`/api/routes/${routeId}/buses?skip=${skip}&limit=${limit}&populate=true`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.at.least(Math.min(limit, buses.length));
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectBus(s, true));
          done();
        })
        .catch(done);
    });
  });
});
