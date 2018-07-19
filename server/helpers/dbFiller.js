const User = require('@/user/user.model');
const Stop = require('@/stop/stop.model');
const Route = require('@/route/route.model');
// const Bus = require('@/bus/bus.model');
const PendingUser = require('@/pendingUser/pendingUser.model');
// const Event = require('@/event/event.model');
const log = require('@config/winston')(module);
const _ = require('lodash');
const routesData = require('./routesData');
const usersData = require('./usersData');
// const eventsData = require('./eventsData');

/**
 * Fills User's DB and return saved  docs
 */
async function fillRouteDB() {
  await Route.remove({}).exec();
  await Promise.all(
    routesData.map(async (r) => {
      const origin = (await Stop.findOne({ name: r.origin.name }).exec())._id;
      const destination = (await Stop.findOne({ name: r.destination.name }).exec())._id;
      const waypoints = await Promise.all(
        r.waypoints.map(async w => (await Stop.findOne({ name: w.name }).exec())._id)
      );
      const {
        routeName: name, strokeColor: color, estimatedTime, distance
      } = r;
      return new Route({
        name,
        origin,
        estimatedTime,
        distance,
        destination,
        waypoints,
        color
      }).save();
    })
  );
  log.debug(`fill route db with ${await Route.countDocuments({}).exec()} docs`);
}

async function fillStopDB() {
  Stop.remove({}).exec();
  const stops = _.uniqBy(
    _.flattenDeep(routesData.map(x => [x.origin, x.destination, x.waypoints])),
    'name'
  );

  await Promise.all(
    stops.map(x => new Stop({
      name: x.name,
      address: x.name,
      location: {
        type: 'Point',
        coordinates: [x.coords.longitude, x.coords.latitude]
      }
    }).save())
  );
  log.debug(`fill stop db with ${await Stop.countDocuments({}).exec()} docs`);
  return Stop.find({}).exec();
}
async function fillUserDB() {
  User.remove({}).exec();
  await Promise.all(usersData.map(x => new User(x).save()));
  await Promise.all(
    await User.find({})
      .exec()
      .map(x => x.update({ isEmailConfirmed: true }))
  );
  log.debug(`fill user db with ${await User.countDocuments({}).exec()} docs`);
  return User.find({}).exec();
}
function fillAllDBs() {
  return clear()
    .then(() => fillUserDB())
    .then(() => fillStopDB())
    .then(() => fillRouteDB());
  // .then(() => fillBusDB())
  // .then(() => fillEventDB());
}
function clear() {
  log.debug('clear all DBs');
  return Promise.all([
    // Event.remove().exec(),
    PendingUser.remove().exec(),
    User.remove().exec(),
    Stop.remove().exec()
    // Bus.remove().exec(),
    // Route.remove().exec(),
    // Stop.remove().exec()
  ]);
}

module.exports = {
  fillAllDBs,
  clear,
  fillStopDB,
  fillUserDB
};
