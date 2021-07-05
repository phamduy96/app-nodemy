const VoucherModel = require('../models/voucher')

function getAllVoucher(){
    return VoucherModel.find({})
}

function createVoucher(voucher){
    return VoucherModel.create(voucher)
}

function deleteVoucher(id){
    return VoucherModel.deleteOne({
        _id: id
    })
}

function findVoucherByName(txt){
    let date = new Date();
    date.setMinutes(0);
    date.setHours(0);
    date.setSeconds(0);
    return VoucherModel.findOne({
        name: txt,
        quantity:{
            $gt: 0
        },
        expired: {
            $gte: date
        }
    })
}

function findVoucherById(idVoucher){
    return VoucherModel.findOne({
        _id: idVoucher
    })
}

function updateVoucher(id, newVoucher){
    return VoucherModel.updateOne({
        _id: id
    }, newVoucher)
}

function caculationVoucher(voucher){
    return VoucherModel.findByIdAndUpdate({
        _id: voucher
    },{
       $inc: { quantity: -1}
    })
}

module.exports = {
    createVoucher,
    getAllVoucher,
    deleteVoucher,
    findVoucherByName,
    updateVoucher,
    findVoucherById,
    caculationVoucher
}