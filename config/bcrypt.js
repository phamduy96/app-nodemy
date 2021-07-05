const bcrypt = require('bcrypt');
const saltRounds = 10;

var hash = function(myPlaintextPassword) {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(myPlaintextPassword, salt);
}

module.exports = hash;