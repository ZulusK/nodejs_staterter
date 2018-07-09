const _=require("lodash");
const path=require("path");
const fs=require("fs");

function forEachInDirDo(path, callback){
    if(!_.isFunction(callback)||!path) return;
    fs.readdirSync(path)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function (file) {
            callback(file);
        });

}

function buildIndexFile(dirname,destModule){
    forEachInDirDo(dirname,file=>destModule.exports[file.substring(0,file.lastIndexOf(".")||file.length)]=require(path.resolve(dirname,file)));
}


module.exports={
    forEachInDirDo,
    buildIndexFile
}