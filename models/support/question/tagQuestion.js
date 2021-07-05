var mongoose = require('../../../config/dbContext')
var Schema = mongoose.Schema;

var tagQuestionSchema = new Schema({
    content: String
}, {
    collection: 'tagQuestionSupport'
});

let TagQuestionModel = mongoose.model('tagQuestionSupport', tagQuestionSchema);

module.exports = TagQuestionModel;