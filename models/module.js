var mongoose = require('../config/dbContext')
var _ = require('lodash')
var Schema = mongoose.Schema;

var moduleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    lessons: [{
        type: String,
        ref: 'lesson'
    }],
    points: [{
        title: String,
        level: Number
    }],
    image:{
        default:"./public/images/logo.png",
        type:String,
        required:true
    },
    ticket: Number,
    originalPrice: Number,
    salePrice: Number,
    author: {
        type: String,
        ref: 'account'
    },
    votes: [{
        student: {
            type: String,
            ref: 'account'
        },
        comment: String,
        rate: Number
    }],
    benifit: [],
    tag: String,
    urlIntro: String,
}, {
    collection: 'module',
    toJSON: { virtuals: true }
});

moduleSchema.virtual('rate').get(function() {
    let rate = _.meanBy(this.votes, 'rate') || 0;
    return rate.toFixed(1)
});

let ModuleModel = mongoose.model('module', moduleSchema);

module.exports = ModuleModel;