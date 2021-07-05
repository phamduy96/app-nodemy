var mongoose = require('../config/dbContext');
const { Schema } = require('../config/dbContext');
const _ = require('lodash')

let scoreSchema = mongoose.Schema({
    idAccount: {
        type: String,
        ref: 'account'
    },
    idClass: {
        type: String,
        ref: 'class'
    },
    point: {
        type: [{
            module: {
                type: String,
                ref: 'module'
            },
            level: String,
            title: String,
            point: Number,
            note: String,
            date: {
                type: Date,
                default: Date.now()
            }
        }],
        default: null
    },
    attendance: {
        type: [{
            attend: Number,
            lesson: Number,
            idlesson: {
                type: Schema.Types.ObjectId,
                ref: 'lesson'
            },
            note: String,
            date: {
                type: Date,
                default: Date.now()
            }
        }],
        default: null
    },
    //0:disable, 1:active
    status: {
        type: Number,
        default: 1
    },
});

scoreSchema.virtual('averagePointAllModule').get(function () {
    var objListPoint = _.groupBy(this.point, 'module')
    var rs = []
    for (const key in objListPoint) {
        if (objListPoint.hasOwnProperty(key)) {
            const listPoint = objListPoint[key];
            //logic
            var sum = _.reduce(listPoint, (all, current) => {
                return all + (current.point * +current.level)
            }, 0)

            var divide = _.reduce(listPoint, (all, current) => {
                return all + +current.level
            }, 0)

            var avg = sum / divide;
            rs.push({
                module: key,
                avg: avg
            })
            //end logic
        }
    }

    return rs;
});

scoreSchema.virtual('averagePoint').get(function () {
    const average = _.meanBy(this.averagePointAllModule, (p) => p.avg);
    return average;
});


let ScoreModel = mongoose.model('score', scoreSchema);


module.exports = ScoreModel