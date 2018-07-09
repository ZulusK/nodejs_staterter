module.exports = {
    username: {
        length: {
            max: 20,
            min: 5
        },
        regExp: /^\w{3,15}$/
    },
    password: {
        length: {
            min: 8,
            max: 16
        },
        regExp: /^(?=.*\d.*)(?=.*[a-z].*)(?=.*[A-Z].*)(?=.*[!#$%&?]*.*).{8,16}$/
    }
};