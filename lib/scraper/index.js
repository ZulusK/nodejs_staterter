require("module-alias/register");
const rp = require("request-promise");
const log = require("@app").logger(module);
const $=require("cherio");
const URL = "https://com-x.life/";

rp(URL)
    .then(response => {
        log.info(response);
    })
    .catch(error => {
        log.error(error);
        throw error;
    });
