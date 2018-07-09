const path = require("path");

module.exports = {
    DB: {
        username:process.env.DB_LOGIN,
        password:process.env.DB_PASSWORD,
        databse:process.env.DB_NAME,
        host:"127.0.0.1",
        dialect: "postgres",
        operatorsAliases: "Op",
    },
    IS_DEV: false,
    LOG_LEVEL: "info",
    PUBLIC_DIR: path.join(__dirname, "../public"),
    PASSWORD_SALT_LENGTH: process.env.PASSWORD_SALT_LENGTH || 10,
    TOKEN_SECRET_SALT_LENGTH: process.env.TOKEN_SECRET_SALT_LENGTH || 5,
    TOKEN_SALT_ACCESS: process.env.TOKEN_SALT_ACCESS || 10,
    TOKEN_SALT_REFRESH: process.env.TOKEN_SALT_REFRESH || 10,
    TOKEN_LIFE_ACCESS: 1e3 * 60 * 60, // 1 hour
    TOKEN_LIFE_REFRESH: 1e3 * 60 * 60 * 24, // 1 day
    TOKEN_GENERATOR_ALGORITHM: "HS256",
    validation: require("./validation")
};