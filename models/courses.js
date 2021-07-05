const mongoose = require('../config/dbContext');
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
    account: {
        type: String,
        ref: 'account'
    },
    module: {
        type: String,
        ref: 'module'
    },
    status: {
        type: String,
        default: 'inactive'
    },
    result: [{
        idLesson: {
            type: String,
            ref: 'lesson'
        },
        status: {
            type: String,
            default: 'prepare'
        },
        complete: {
            type: Number,
            default: 0
        }
    }],
    created: {
        type: Date,
        default: new Date()
    }
}, {
    collection: 'course'
});

var CourseModel = mongoose.model('course', CourseSchema);
module.exports = CourseModel;