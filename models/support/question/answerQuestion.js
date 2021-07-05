var mongoose = require('../../../config/dbContext')
var Schema = mongoose.Schema;

var answerQuestionSchema = new Schema({
    content: String,
}, {
    collection: 'answerQuestionSupport'
});

let AnswerQuestionModel = mongoose.model('answerQuestionSupport', answerQuestionSchema);

module.exports = AnswerQuestionModel;