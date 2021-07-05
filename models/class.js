var mongoose = require('../config/dbContext')
var Schema = mongoose.Schema;
let classSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        ref: 'account',
        required: true
    },
    idSyllabus:{
        type: Schema.Types.ObjectId,
        ref: 'syllabus'
    },
    time:String,
    dayStart:Date,
    dayEnd:Date
}, { collection: 'class'});

let ClassModel = mongoose.model('class', classSchema);


module.exports = ClassModel