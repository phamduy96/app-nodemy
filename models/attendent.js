var mongoose = require('../config/dbContext')
let AttendentSchema = mongoose.Schema({
    idStaff: String,
    date: String,
    startWork: String,
    endWork: String,
    absent: String,
    notes: String
}, { collection: 'attendent'});

let AttendentModel = mongoose.model('attendent', AttendentSchema);


module.exports = AttendentModel