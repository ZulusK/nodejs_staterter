const { createLogger, format, transports } = require('winston');

const config=require("@config");
function getLogger(module) {
    const path = module.filename.split("/").slice(-2).join("/");
    return createLogger({
        format:format.combine(
            format.splat(),
            format.label({ label: path }),
            format.colorize(),
            format.printf(info => `${info.label} ${info.level}: ${info.message}`),
        ),
        transports: [
            new transports.Console({
                colorize: true,
                level: config.get("LOG_LEVEL")
                // silent: process.env.NODE_ENV.startsWith("test"),
            }),
        ],
    });
}

module.exports = getLogger;