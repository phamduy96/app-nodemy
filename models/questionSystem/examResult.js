let mongoose = require('../../config/dbContext');
let Schema = mongoose.Schema;

let examResult = new Schema({
    type_exam: {
        type: String,
        enum: ['EXAM', 'TRAIN']
    },
    exam: {
        type: String,
        ref: 'exam'
    },
    student: {
        type: String,
        ref: 'account'
    },
    time_finish_exam: Number,
    student_result: {
        type: [{
            question: {
                type: String,
                ref: 'question'
            },
            // id của 1 item trong mảng answer
            answer_list: [String]
        }]
    },
    true_answer_number: Number,
    total_question_number: Number
}, {
    timestamps: true,
});

let ExamModel = mongoose.model('examResult', examResult);
module.exports = ExamModel;