var mongoose = require('../config/dbContext')
var Schema = mongoose.Schema;
let transactionSchema = mongoose.Schema({
    idAccount: {
        type: String,
        ref: 'account'
    },
    idClass: {
        type: String,
        ref: 'class'
    },
    totalMoney: {
        type:Number,
        default:0
    },
    price: {
        type:Number,
        default:30000
    },
    isMoney: {
        type: Boolean,
        default: false,
    },        
    transactions: {
        type: [{
            money: Number,
            saler: {
                type: String,
                ref: "account"
            },
            date: {
                type: Date,
                default: Date.now()
            },
        }]
    }
    
}, { collection: 'transaction' });

let TransactionModel = mongoose.model('transaction', transactionSchema);


module.exports = TransactionModel