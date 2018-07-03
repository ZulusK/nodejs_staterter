const express =require("express");
const path =require("path");
const logger =require("morgan");
const log=require("@app").logger(module);
const appRouters =require("@app/routes");
require("./models");


const app =express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(appRouters);

log.info(`server is up`);

module.exports = app;
