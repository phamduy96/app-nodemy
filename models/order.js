var mongoose = require("../config/dbContext");
var Schema = mongoose.Schema;

var orderSchema = new Schema(
  {
    idAccount: {
      type: String,
      ref: "account",
    },
    combo: [
      {
        type: String,
        ref: "syllabus",
      },
    ],
    courses: [
      {
        type: String,
        ref: "module",
      },
    ],
    voucher: {
      type: String,
      ref: "vouchers",
    },
    contact: {
      name: String,
      phone: String,
      note: String
    },
    status: {
      type: String,
      default: 'review'
    },
    activeAllCourses:{
      type:Boolean,
      default:false
    },
    code: {
      type: String,
      default: function(){
        let id = this._id.toString()
        return id.substring(id.length - 6, id.length).toUpperCase()
      }
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    totalTicket: {
      type: Number,
      default: 0
    },
    created: {
      type: Date,
      default: new Date(),
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

orderSchema.index({'$**': 'text'});
let OrderModel = mongoose.model("orders", orderSchema);
module.exports = OrderModel;
