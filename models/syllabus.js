var mongoose = require('../config/dbContext')
var Schema = mongoose.Schema;
let syllabusSchema = mongoose.Schema({
    title: String,
    description: String,
    modules: [{
        type: String,
        ref: 'module'
    }],
    originalPrice: Number,
    salePrice: Number
}, { collection: 'syllabus' });

let SyllabusModel = mongoose.model('syllabus', syllabusSchema);

module.exports = SyllabusModel