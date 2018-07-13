require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Stop = require('@server/stop/stop.model');
const usefullReqs = require('@tests/tests.reqs');
const usefullTests = require('@tests/tests.tests');
const filler = require('@helpers/dbFiller');
const { ObjectId } = require('mongoose').Types;

chai.config.includeStack = true;

describe('## Stop APIs', () => {
  let stops = [];
  before((done) => {
    filler
      .fillStopDB()
      .then((savedStops) => {
        stops = savedStops;
        done();
      })
      .catch(done);
  });
  after((done) => {
    Stop.remove({})
      .exec()
      .then(() => done())
      .catch(done);
  });
  describe('# Get /api/stops/:stopId', () => {
    it('should return valid stop info', (done) => {
      request(app)
        .get(`/api/stops/${stops[0]._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          usefullTests.expectStop(res.body);
          done();
        })
        .catch(done);
    });
    it('should reject, used not-existing id', (done) => {
      request(app)
        .get(`/api/stops/${ObjectId()}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid id', (done) => {
      request(app)
        .get('/api/stops/wdnd2lkln@')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
  describe('# Get /api/stops', () => {
    it('should return valid stops info, without query', (done) => {
      request(app)
        .get('/api/stops/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(stops.length);
          res.body.forEach(s => usefullTests.expectStop(s));
          done();
        })
        .catch(done);
    });
    it('should return valid stops info, limit=2', (done) => {
      const limit = 2;
      request(app)
        .get(`/api/stops?limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(limit);
          res.body.forEach(s => usefullTests.expectStop(s));
          done();
        })
        .catch(done);
    });
    it('should return valid stops info, skip=2', (done) => {
      const skip = 2;
      request(app)
        .get(`/api/stops?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(stops.length - skip);
          res.body.forEach(s => usefullTests.expectStop(s));
          done();
        })
        .catch(done);
    });
    it('should return valid stops info, skip=20, limit=4', (done) => {
      const skip = 20;
      const limit = 4;
      request(app)
        .get(`/api/stops?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(limit);
          res.body.forEach(s => usefullTests.expectStop(s));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = 100;
      request(app)
        .get(`/api/stops?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.empty;
          done();
        })
        .catch(done);
    });
    it('should return valid stops, without skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/stops?skip=${skip}&limit=${limit}`)
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
