var mongoose = require('../config/dbContext')
var Schema = mongoose.Schema;

var lessonSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    quizz:[
        {
            type:String,
            ref:"question"
        }
    ],
    createAt: Number,
}, {
    collection: 'lesson'
});

let LessonModel = mongoose.model('lesson', lessonSchema);

module.exports = LessonModel;