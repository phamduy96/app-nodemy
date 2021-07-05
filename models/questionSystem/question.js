let mongoose = require("../../config/dbContext");
let Schema = mongoose.Schema;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

let questionShema = new Schema({
    description: String,
    question: String,
    answer: [{
        content: String,
        result: Boolean
    }],
    explain: String,
    module: [String]
}, {
    timestamps: true,
});
questionShema.index({'description': 'text', 'question': 'text'});

let QuestionModel = mongoose.model("question", questionShema);
module.exports = QuestionModel;