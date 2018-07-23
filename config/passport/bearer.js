const { ExtractJwt, Strategy } = require('passport-jwt');

function createStrategy({ getByToken, secretOrKey }) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey
  };
  return new Strategy(opts, (jwtPayload, next) => getByToken(jwtPayload)
    .then((user) => {
      if (user) {
        next(null, user);
      } else {
        next(null, false);
      }
    })
    .catch(() => next(null, false)));
}

module.exports = {
  createStrategy
};
