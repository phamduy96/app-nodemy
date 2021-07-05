var mongoose = require('../../../config/dbContext')
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    idStudent: {
        type: String,
        ref: "account"
    },
    idTeacher: {
        type: String,
        ref: "account"
    },
    description: String,
    createAt: {
        type: Date,
        default: new Date()
    },
    doneAt: Date,
    imageQuestion: [String],
    answerQuestion: [{
        type: String,
        ref: "answerQuestion"
    }],
    status:{
        type: String,
        default: "review"
    },
    solution: {
        type: String
    },
    timeBook: Date,
    tags: [{
        type: String,
        ref: 'tagQuestionSupport'
    }]
}, {
    collection: 'questionSupport'
});

let QuestionSupportModel = mongoose.model('questionSupport', questionSchema);

module.exports = QuestionSupportModel;