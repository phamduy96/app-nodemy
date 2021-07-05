var AttendentModel = require("../models/attendent");
var AttendentServices = {}

AttendentServices.findAttendent = function(){
    return AttendentModel.find({
    })
}
AttendentServices.findAttendentByIdStaff = function(id){
    return AttendentModel.find({
        idStaff: id
    })
}
AttendentServices.findAttendentFolowDay = function (id, date) {
    return AttendentModel.findOne({
        idStaff: id,
        date: date
    })
}
AttendentServices.createAttendent = function (info) {
    let { idStaff, date, startWork, endWork, absent, notes } = info
    return AttendentModel.create({
        idStaff,
        date,
        startWork,
        endWork,
        absent,
        notes
    })
}
AttendentServices.updateAttendent = function (info) {
    let {idStaff, date, startWork, endWork, absent, notes } = info
    return AttendentModel.updateOne({
        idStaff,
        date
    },{
        startWork,
        endWork,
        absent,
        notes
    })
}

module.exports = AttendentServices