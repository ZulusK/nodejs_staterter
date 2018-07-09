const express = require("express");
const utils = require("@utils");
const router = express.Router();


utils.fs.forEachInDirDo(__dirname, file => {
        router.use("/" + file.replace(/\.js$/, ""), require(`./${file}`));
});

module.exports = router;