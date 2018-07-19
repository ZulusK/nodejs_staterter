require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Event = require('./event.model');
const reqs = require('@tests/reqs');
const tests = require('@tests/tests');
const filler = require('@helpers/dbFiller');
const { ObjectId } = require('mongoose').Types;

chai.config.includeStack = true;

describe('## Events APIs', () => {
  let events = [];
  before((done) => {
    filler
      .fillAllDBs()
      .then(() => Event.find().exec())
      .then((savedEvents) => {
        events = savedEvents;
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
  describe('# Get /api/events/:eventId', () => {
    it('should return valid event info', (done) => {
      request(app)
        .get(`/api/events/${events[0]._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          tests.expectEvent(res.body);
          done();
        })
        .catch(done);
    });
    it('should reject, used not-existing id', (done) => {
      request(app)
        .get(`/api/events/${ObjectId()}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid id', (done) => {
      request(app)
        .get('/api/events/wdnd2lkln@')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });
  describe('# Get /api/events', () => {
    it('should return valid events info, without query', (done) => {
      request(app)
        .get('/api/events/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(events.length);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectEvent(s));
          done();
        })
        .catch(done);
    });
    it('should return valid events info, limit=2', (done) => {
      const limit = 2;
      request(app)
        .get(`/api/events?limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(limit);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.of.at.most(limit);
          expect(res.body.offset).to.of.eq(0);
          res.body.docs.forEach(s => tests.expectEvent(s));
          done();
        })
        .catch(done);
    });
    it('should return valid events info, skip=2', (done) => {
      const skip = 2;
      request(app)
        .get(`/api/events?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length.of.at.most(events.length - skip);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.at.least(res.body.docs.length);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectEvent(s));
          done();
        })
        .catch(done);
    });
    it('should return valid events info, skip=1, limit=2', (done) => {
      const skip = 1;
      const limit = 2;
      request(app)
        .get(`/api/events?skip=${skip}&limit=${limit}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectEvent(s));
          done();
        })
        .catch(done);
    });
    it('should return valid events full info, skip=1, limit=2, populate=true', (done) => {
      const skip = 1;
      const limit = 2;
      request(app)
        .get(`/api/events?skip=${skip}&limit=${limit}&populate=true`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectEvent(s, true));
          done();
        })
        .catch(done);
    });
    it('should return valid events full info, skip=1, limit=2, populate=invalid', (done) => {
      const skip = 1;
      const limit = 2;
      request(app)
        .get(`/api/events?skip=${skip}&limit=${limit}&populate=invalid`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.have.length(limit);
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.limit).to.be.eq(limit);
          expect(res.body.offset).to.of.eq(skip);
          res.body.docs.forEach(s => tests.expectEvent(s, true));
          done();
        })
        .catch(done);
    });
    it('should return empty array, skip=100', (done) => {
      const skip = 100;
      request(app)
        .get(`/api/events?skip=${skip}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          expect(res.body.docs).to.be.empty;
          expect(res.body.total).to.be.eq(events.length);
          expect(res.body.offset).to.of.eq(skip);
          done();
        })
        .catch(done);
    });
    it('should return valid events, without skipping&limitting, used invalid query', (done) => {
      const skip = 'invalid';
      const limit = 'aaa';
      request(app)
        .get(`/api/events?skip=${skip}&limit=${limit}`)
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
