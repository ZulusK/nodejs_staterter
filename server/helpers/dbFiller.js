const User = require('@server/user/user.model');
const Stop = require('@server/stop/stop.model');
const Route = require('@server/route/route.model');
const Bus = require('@server/bus/bus.model');
const PendingUser = require('@server/pendingUser/pendingUser.model');
const Event = require('@server/event/event.model');
const log = require('@config/winston');
const _ = require('lodash');
const routesData = require('./routesData');
const eventsData = require('./eventsData');
/**
 * Fills User's DB and return saved  docs
 */
const usersData = require('./usersData');

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
/**
 * Fills Stop's DB and return saved  docs
 */
async function fillStopDB() {
  Stop.remove({}).exec();
  const stops = _.uniqBy(
    _.flattenDeep(routesData.map(x => [x.origin, x.destination, x.waypoints])),
    'name'
  );

  await Promise.all(
    stops.map(x => new Stop({
      name: x.name,
      location: {
        type: 'Point',
        coordinates: [x.coords.longitude, x.coords.latitude]
      }
    }).save())
  );
  log.debug(`fill stop db with ${await Stop.countDocuments({}).exec()} docs`);
  return Stop.find({}).exec();
}
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
/**
 * Fills Bus's DB and return saved  docs
 */
async function fillBusDB() {
  await Bus.remove({}).exec();
  const routes = await Route.find({}).exec();
  await Promise.all(
    [...Array(20).keys()].map(async (k) => {
      const route = routes[k % routes.length];
      const stop = await Stop.findById(route.waypoints[k % route.waypoints.length]).exec();
      return new Bus({
        name: `Bus #${k}`,
        seatsCount: 50 - k,
        location: stop.location,
        route: route._id
      }).save();
    })
  );
  log.debug(`fill bus db with ${await Bus.countDocuments({}).exec()} docs`);
}

async function fillEventDB() {
  const existingRoutes = await Route.find().exec();
  await Promise.all(
    eventsData.map((e, i) => new Event({
      ...e,
      routes: [existingRoutes[i % existingRoutes.length]._id],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 4e8 * i)
    }).save())
  );
  log.debug(`fill event db with ${await Event.countDocuments({}).exec()} docs`);
}

function fillAllDBs() {
  return clear()
    .then(() => fillUserDB())
    .then(() => fillStopDB())
    .then(() => fillRouteDB())
    .then(() => fillBusDB())
    .then(() => fillEventDB());
}
function clear() {
  return Promise.all([
    Event.remove().exec(),
    PendingUser.remove().exec(),
    User.remove().exec(),
    Bus.remove().exec(),
    Route.remove().exec(),
    Stop.remove().exec()
  ]);
}
module.exports = {
  clear,
  fillAllDBs,
  fillEventDB,
  fillBusDB,
  fillRouteDB,
  fillUserDB,
  fillStopDB,
  usersData,
  routesData
};
