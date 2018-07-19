const PendingUser = require('@/pendingUser/pendingUser.model');
const User = require('@/user/user.model');

function fillAllDBs() {
  return clear();
  // .then(() => fillUserDB())
  // .then(() => fillStopDB())
  // .then(() => fillRouteDB())
  // .then(() => fillBusDB())
  // .then(() => fillEventDB());
}
function clear() {
  return Promise.all([
    // Event.remove().exec(),
    PendingUser.remove().exec(),
    User.remove().exec()
    // Bus.remove().exec(),
    // Route.remove().exec(),
    // Stop.remove().exec()
  ]);
}

module.exports = {
  fillAllDBs,
  clear
};
