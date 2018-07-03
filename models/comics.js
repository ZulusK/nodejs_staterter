'use strict';
module.exports = (sequelize, DataTypes) => {
    const Comics = sequelize.define('Comics', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        downloadLink:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        theme:{
            type:DataTypes.STRING,
            allowNull:false
        }
    }, {});
    return Comics;
};