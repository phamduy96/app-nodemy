let mongoose = require("../../config/dbContext");
let Schema = mongoose.Schema;

let examShema = new Schema(
  {
    name: String,
    question: [{ 
        type: String,
        ref: "question" 
    }],
    isOfficial:{
      type:String,
      default:true
    },
    class: {
      type: String,
      ref: 'class'
    },
    minute: Number,
    //  0: bắt đầu exam, 1: exam đã kết thúc
    status: {
      type: Number,
      default: 0,
    },
    student: [{
      type: String,
      ref: "account"
    }],
  },
  {
    timestamps: true,
  }
);

let ExamModel = mongoose.model("exam", examShema);
module.exports = ExamModel;
