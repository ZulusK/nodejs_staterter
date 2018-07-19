require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Bus = require('@/bus/bus.model');
const reqs = require('@tests/reqs');
const tests = require('@tests/tests');
const filler = require('@helpers/dbFiller');
const { ObjectId } = require('mongoose').Types;

chai.config.includeStack = true;

describe('## Bus APIs', () => {
  let buses = [];
  before((done) => {
    filler
      .fillAllDBs()
      .then(() => Bus.find().exec())
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
    it('should return valid bus info', (done) => {
      request(app)
        .get(`/api/buses/${buses[0]._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          tests.expectBus(res.body, true);
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
    it('should return valid buses info, limit=2', (done) => {
      const limit = 2;
      request(app)
        .get(`/api/buses?limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(limit);
          expect(res.body.total).to.be.eq(buses.length);
          expect(res.body.limit).to.be.of.at.most(limit);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectBus(s));
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
    it('should return valid buses info, skip=1, limit=4', (done) => {
      const skip = 1;
      const limit = 4;
      request(app)
        .get(`/api/buses?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
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
        .get(`/api/buses?skip=${skip}`)
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
        .get(`/api/buses?skip=${skip}&limit=${limit}`)
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
