const swaggerUi = require('swagger-ui-express');
const express = require("express");
const router = express.Router();
const swaggerDocument=require("./swagger-doc.json");

const options = {
    explorer: true
};

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

module.exports = router;