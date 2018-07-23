const { BasicStrategy } = require('passport-http');

function createStrategy({ getByCredentials }) {
  return new BasicStrategy(async (username, password, next) => {
    try {
      const user = await getByCredentials(username, password);
      if (user) {
        next(null, user);
      } else {
        next(undefined, false, { message: 'No such user' });
      }
    } catch (err) {
      next(null, false);
    }
  });
}

module.exports = {
  createStrategy
};
