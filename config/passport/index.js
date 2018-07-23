const passport = require('passport');
const bearer = require('./bearer');
const basic = require('./basic');
const config = require('@config/config');
const User = require('@/user/user.model');

function initialize() {
  passport.use(
    'jwt.a.user',
    bearer.createStrategy({
      getByToken: payload => User.getByToken(payload),
      secretOrKey: config.jwtSecretAccessUser
    })
  );
  passport.use(
    'jwt.r.user',
    bearer.createStrategy({
      getByToken: payload => User.getByToken(payload),
      secretOrKey: config.jwtSecretRefreshUser
    })
  );
  passport.use(
    'basic.user',
    basic.createStrategy({
      getByCredentials: (email, password) => User.getByCredentials({ email, password })
    })
  );
  return passport.initialize();
}

const jwtUserAccess = passport.authenticate('jwt.a.user', { session: false });
const jwtUserRefresh = passport.authenticate('jwt.r.user', { session: false });
const basicUser = passport.authenticate('basic.user', { session: false });
module.exports = {
  jwtUserAccess,
  jwtUserRefresh,
  basicUser,
  initialize
};
