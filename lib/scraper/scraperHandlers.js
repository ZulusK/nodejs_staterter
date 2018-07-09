const log=require("@app").logger(module);

// just print response to console
module.exports.defaultHanler=(ctx)=>{
    log.debug(ctx.response);
};