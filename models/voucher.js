var mongoose = require('../config/dbContext')
var Schema = mongoose.Schema;

var voucherSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    discount: Number,
    expired: Date,
    quantity: Number,
    created: {
        type: Date,
        default: new Date()
    }
});

let VoucherModel = mongoose.model('vouchers', voucherSchema);
module.exports = VoucherModel;