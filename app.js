const express =require("express");
const path =require("path");
const logger =require("morgan");
const log=require("@app").logger(module);
const appRouters =require("@app/routes");
const db=require("./models");
const  helmet = require("helmet");
const cors=require("cors");
const expressValidator=require("express-validator");
const compression=require("compression");
// sync database
db.sequelize.sync().then(function() {
    log.info('Database synced')
}).catch(function(err) {
    log.error(err, "Something went wrong with the Database Update!")
});

const app =express();

app.use(helmet());
app.use(cors());
app.use(expressValidator());
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"),{maxAge: "10h"}));

// add server routes
app.use(appRouters);

log.info(`server is up`);

module.exports = app;
