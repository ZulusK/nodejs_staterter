const User = require('@server/user/user.model');
const Stop = require('@server/stop/stop.model');
const Route = require('@server/route/route.model');
const Bus = require('@server/bus/bus.model');
const log = require('@config/winston');
const _ = require('lodash');

const routesData = [
  {
    _id: 'asdkjasdhkj3hddjoid1j1',
    routeName: 'West Route',
    origin: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    destination: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },

    waypoints: [
      { name: 'NUS', coords: { latitude: 1.300259, longitude: 103.77079 } },
      { name: 'Clementi MRT', coords: { latitude: 1.3151606, longitude: 103.7652 } },
      { name: 'Jurong East MRT', coords: { latitude: 1.3331306, longitude: 103.7420909 } },
      { name: 'Boon Lay MRT', coords: { latitude: 1.3385559, longitude: 103.70582769 } },
      { name: 'Pioneer MRT', coords: { latitude: 1.3375852, longitude: 103.69724819 } }
    ],
    strokeColor: 'red',
    stops: 5,
    distance: '44.8 km',
    estimatedTime: '1 hr 13 mins'
  },
  {
    _id: 'asdketetedhkj3hddjoid1j1',
    routeName: 'North West Route',
    origin: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    destination: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },

    waypoints: [
      { name: 'Beauty World MRT', coords: { latitude: 1.3416955, longitude: 103.7759701 } },
      { name: 'Bukit Batok MRT', coords: { latitude: 1.3485565, longitude: 103.7491737 } },
      { name: 'Bukit Gombak MRT', coords: { latitude: 1.3589407, longitude: 103.75184309 } },
      { name: 'Choa Chu Kang MRT', coords: { latitude: 1.3854469, longitude: 103.7443355 } },
      { name: 'Marsiling MRT', coords: { latitude: 1.4325252, longitude: 103.7741019 } },
      { name: 'Woodlands MRT', coords: { latitude: 1.4369416, longitude: 103.78639529 } }
    ],
    strokeColor: 'blue',
    stops: 6,
    distance: '44.8 km',
    estimatedTime: '1 hr 13 mins'
  },
  {
    _id: 'avbgnhnetedhkj3hddjoid1j1',
    routeName: 'North Route',
    origin: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    destination: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    waypoints: [
      { name: 'Toa Payoh MRT', coords: { latitude: 1.3326911, longitude: 103.84707849 } },
      { name: 'Bishan MRT', coords: { latitude: 1.3485565, longitude: 103.83521159 } },
      { name: 'Ang Mo Kio MRT', coords: { latitude: 1.3699718, longitude: 103.84958759 } },
      { name: 'Yio Chu Kang MRT', coords: { latitude: 1.3817217, longitude: 103.8449339 } },
      { name: 'Yishun MRT', coords: { latitude: 1.4294295, longitude: 103.83502829 } }
    ],
    strokeColor: 'green',
    stops: 5,
    distance: '44.8 km',
    estimatedTime: '1 hr 13 mins'
  },
  {
    _id: 'avbglkjetedhkj3hddjoid1j1',
    routeName: 'North East Route',
    origin: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    destination: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    waypoints: [
      { name: 'Serangoon MRT', coords: { latitude: 1.3497383, longitude: 103.8736211 } },
      { name: 'Kovan MRT', coords: { latitude: 1.3599937, longitude: 103.88530089 } },
      { name: 'Hougang MRT', coords: { latitude: 1.3711262, longitude: 103.89253719 } },
      { name: 'Buangkok MRT', coords: { latitude: 1.3831446, longitude: 103.8931018 } },
      { name: 'Seng Kang MRT', coords: { latitude: 1.3915277, longitude: 103.8954161 } },
      { name: 'Punggol MRT', coords: { latitude: 1.40517, longitude: 103.90235589 } }
    ],
    strokeColor: 'orange',
    stops: 5,
    distance: '44.8 km',
    estimatedTime: '1 hr 13 mins'
  },
  {
    _id: 'avwqqqqlkjetedhkj3hddjoid1j1',
    routeName: 'East Route',
    origin: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    destination: {
      name: 'Tan Tye Place',
      coords: {
        latitude: 1.2912642,
        longitude: 103.845232
      }
    },
    waypoints: [
      { name: 'Bedok MRT', coords: { latitude: 1.3240113, longitude: 103.9301725 } },
      { name: 'Simei MRT', coords: { latitude: 1.3431974, longitude: 103.9533771 } },
      { name: 'Tampines MRT', coords: { latitude: 1.3546232, longitude: 103.9426673 } },
      { name: 'Pasir Ris MRT', coords: { latitude: 1.3731458, longitude: 103.9492956 } }
    ],
    strokeColor: 'purple',
    stops: 4,
    distance: '44.8 km',
    estimatedTime: '1 hr 13 mins'
  }
];
/**
 * Fills User's DB and return saved  docs
 * @returns {Promise(User[])} saved docs
 */
const userData = [
  {
    email: 'mail1@gmail.com',
    fullname: 'John',
    password: '123AzsdF@',
    mobileNumber: '+380500719866'
  },
  {
    email: 'mail2@gmail.com',
    fullname: 'Sara',
    password: '123AzsdF@',
    mobileNumber: '+380600719866'
  }
];

async function fillUserDB() {
  User.remove({}).exec();
  await Promise.all(userData.map(x => new User(x).save()));
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
 * @returns {Promise(Stop[])} saved docs
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
 * @returns {Promise(Route[])} saved docs
 */
async function fillRouteDB() {
  await Route.remove({}).exec();
  await Promise.all(
    routesData.map(async (r) => {
      const originId = (await Stop.findOne({ name: r.origin.name }).exec())._id;
      const destinationId = (await Stop.findOne({ name: r.destination.name }).exec())._id;
      const waypoints = Promise.all(
        r.waypoints.map(async w => (await Stop.findOne({ name: w.name }).exec())._id)
      );
      const {
        routeName: name, strokeColor: color, estimatedTime, distance
      } = r;
      return new Route({
        name,
        originId,
        estimatedTime,
        distance,
        destinationId,
        waypoints,
        color
      }).save();
    })
  );
  log.debug(`fill route db with ${await Route.countDocuments({}).exec()} docs`);
}
/**
 * Fills Bus's DB and return saved  docs
 * @returns {Promise(Bus[])} saved docs
 */
async function fillBusDB() {
  await Bus.remove({}).exec();
  const routes = await Route.find({})
    .select({ _id: 1 })
    .exec();
  await Promise.all(
    [...routesData.keys()].map(async k => new Bus({
      name: `Bus #${k}`,
      seatsCount: 50 - k,
      location: routesData[+k].origin.coordinates,
      routeId: routes._id
    }).save())
  );
  log.debug(`fill bus db with ${await Bus.countDocuments({}).exec()} docs`);
}

function exec() {
  return Promise.all([fillUserDB(), fillStopDB(), fillRouteDB(), fillBusDB()]);
}

module.exports = {
  exec,
  fillBusDB,
  fillRouteDB,
  fillUserDB,
  fillStopDB,
  userData,
  routesData
};
