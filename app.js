const express = require("express");
const path = require("path");
const appLogger = require("morgan");
const log = require("@utils").logger(module);
const appRouters = require("@routes");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const config = require("@config");
const busboyBodyParser = require('busboy-body-parser');
const auth=require("@app/auth");
const db=require("@db");
const morgan =require("morgan");

const app = express();

db.connect();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(busboyBodyParser());
app.use(compression());
app.use(appLogger("dev"));
app.use(auth());

app.use(morgan('dev', {
    skip: function (req, res) {
        return res.statusCode < 400
    }, stream: process.stderr
}));

app.use(morgan('dev', {
    skip: function (req, res) {
        return res.statusCode >= 400
    }, stream: process.stdout
}));

app.use(express.static(path.join(__dirname, "public"), config.get("isDev")?{}:{maxAge: "10h"}));

// add server routes
app.use(appRouters);

module.exports = app;
