let QuestionModel = require('../../models/questionSystem/question');
var _ = require('lodash');

async function readAtPage(query, page, limit) {
    page = page || 1;
    let skip = (page - 1) * limit;
    let size = await QuestionModel.countDocuments(query);
    let questions = await QuestionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });
    let pages = Math.ceil(size / limit);
    return {
        question: questions,
        currentPage: page,
        pages: pages,
        limit: limit
    }
}
function readAll() {
    return QuestionModel
        .find()
        .sort({ updatedAt: -1 });
}
function read(query) {
    return QuestionModel
        .find(query)
        .sort({ updatedAt: -1 });
}
function create(question) {
    return QuestionModel
        .create(question);
}
function remove(query) {
    return QuestionModel
        .deleteOne(query);
}
function update(query, question) {
    return QuestionModel
        .update(query, question);
}
async function getAnswer(idArray) {
    return QuestionModel
        .find({ _id: { $in: idArray } });
}
function compareAnswer(studentAnswer, answer) {
    let trueAnswer = findTrueAnswerIdList(answer);

    if (isTrueStudentAnswer(studentAnswer, trueAnswer))
        return true;
    return false;
}

function isTrueStudentAnswer(studentAnswer, trueAnswer) {
    return studentAnswer.length == trueAnswer.length && _.difference(studentAnswer, trueAnswer).length == 0
}

function findTrueAnswerIdList(answer) {
    let trueAnswer = answer.filter(a => {
        if (a.result == true) return a._id
    });
    return trueAnswer.map(e => e._id.toString());
}

async function filteByModule(moduleId, maxSize) {
    let questions = await QuestionModel
        .find({ module: { $in: [moduleId] } })
        .limit(parseInt(maxSize))
        .select({ _id: 1 });
    let questionsId = questions.map(question => question._id);;
    return questionsId;

}

async function createPracticeExam(modules, maxSize) {
    let questions = await QuestionModel
        .find()
        //  .limit(parseInt(maxSize))
        .select({ _id: 1 });
    let questionsId = questions.map(question => question._id);
    size = questionsId.length;
    let result = [];
    for (var i = maxSize - 1; i >= 0; i--) {
        var index = Math.floor(Math.random() * size);
        result.push(questionsId[index]);
        questionsId.splice(index, 1);
        size--;
    }
    return result;

}


module.exports = {
    readAtPage,
    read,
    readAll,
    create,
    remove,
    update,
    getAnswer,
    compareAnswer,
    filteByModule,
    createPracticeExam
}