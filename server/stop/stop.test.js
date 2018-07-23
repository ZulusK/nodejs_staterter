require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Stop = require('@/stop/stop.model');
const reqs = require('@tests/reqs');
const tests = require('@tests/tests');
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
          tests.expectStop(res.body);
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(stops.length);
          expect(res.body.total).to.be.eq(stops.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectStop(s));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(limit);
          expect(res.body.total).to.be.eq(stops.length);
          expect(res.body.limit).to.be.of.at.most(limit);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectStop(s));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(stops.length - skip);
          expect(res.body.total).to.be.eq(stops.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectStop(s));
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(stops.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectStop(s));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = stops.length;
      request(app)
        .get(`/api/stops?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          expect(res.body.total).to.be.eq(stops.length);
          expect(res.body.offset).to.of.eq(skip);
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
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          done();
        })
        .catch(done);
    });
  });
});
