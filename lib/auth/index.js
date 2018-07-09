const utils=require("@utils");
const _=require("lodash");
const passport=require("passport");

utils.fs.buildIndexFile(__dirname,module);

// register all strategies
_.forIn(module.exports,(strategy,name)=>{
    passport.use(name,strategy);
});


module.exports=()=>passport.initialize();