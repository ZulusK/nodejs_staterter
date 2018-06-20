module.exports={
    db:{
        "username": process.env.DB_LOGIN,
        "password": process.env.DB_PASSWORD||null,
        "database": process.env.DB,
        "host": "127.0.0.1",
        "dialect": "postgres"
    }
};