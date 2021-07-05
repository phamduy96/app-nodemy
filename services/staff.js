var AccountModel = require("../models/accounts");
var StaffServices = {}

StaffServices.getListStaff = function(){
    return AccountModel.find({
        $or : [
            {
                role: "admin"
            },
            {
                role: "saler"
            },
            {
                role: "teacher"
            }
        ]
    },{
        password: 0
    })
}
StaffServices.getDetailStaff = function(id){
    return AccountModel.findOne({
        _id: id
    },{
        password: 0
    })
}
module.exports = StaffServices