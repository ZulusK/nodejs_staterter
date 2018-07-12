require('module-alias/register');

const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('@app');
const Stop = require('@server/stop/stop.model');
const usefullTests = require('@helpers/usefull.tests');
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
  describe('# Get /api/stops/', () => {
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
});
