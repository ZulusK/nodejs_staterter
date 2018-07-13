require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Bus = require('@server/bus/bus.model');
const usefullReqs = require('@tests/tests.reqs');
const usefullTests = require('@tests/tests.tests');
const filler = require('@helpers/dbFiller');
const { ObjectId } = require('mongoose').Types;

chai.config.includeStack = true;

describe('## Bus APIs', () => {
  let buses = [];
  before((done) => {
    filler
      .fillAllDBs()
      .then(() => Bus.find({}).exec())
      .then((savedBuses) => {
        buses = savedBuses;
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
  describe('# Get /api/buses/:busId', () => {
    it('should return valid route info', (done) => {
      request(app)
        .get(`/api/buses/${buses[0]._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          usefullTests.expectBus(res.body, true);
          done();
        })
        .catch(done);
    });
    it('should reject, used not-existing id', (done) => {
      request(app)
        .get(`/api/buses/${ObjectId()}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid id', (done) => {
      request(app)
        .get('/api/buses/wdnd2lkln@')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
  describe('# Get /api/buses', () => {
    it('should return valid buses info, without query', (done) => {
      request(app)
        .get('/api/buses/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(buses.length);
          res.body.forEach(s => usefullTests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return valid buses info, limit=2', (done) => {
      const limit = 2;
      request(app)
        .get(`/api/buses?limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(limit);
          res.body.forEach(s => usefullTests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return valid buses info, skip=2', (done) => {
      const skip = 2;
      request(app)
        .get(`/api/buses?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(buses.length - skip);
          res.body.forEach(s => usefullTests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return valid buses info, skip=20, limit=4', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/buses?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length.of.at.most(limit);
          res.body.forEach(s => usefullTests.expectBus(s));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = 100;
      request(app)
        .get(`/api/buses?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.empty;
          done();
        })
        .catch(done);
    });
    it('should return valid buses, without skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/buses?skip=${skip}&limit=${limit}`)
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
