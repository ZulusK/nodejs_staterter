const BasicStrategy = require("passport-http").BasicStrategy;

module.exports = new BasicStrategy(async (username, password, done) => {
    const user = {};
    if (user) {
        return done(null, user);
    } else {
        return done(undefined, false, {message: "Invalid email or password."});
    }
});