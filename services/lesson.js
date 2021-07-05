const LessonModel = require('../models/lessons')

function getAllLesson(){
    return LessonModel.find({}).sort({createAt: -1})
}

function createLesson(title, description,quizz){
    return LessonModel.create({
        title: title,
        description: description,
        quizz:quizz,
        createAt: Date.now()
    })
}

function deleteLesson(id){
    return LessonModel.deleteOne({
        _id: id
    })
}

function findLesson(id){
    return LessonModel.findOne({
        _id: id
    }).populate("quizz");
}

function updateLesson(id, newLesson){
    return LessonModel.updateOne({
        _id: id
    }, newLesson)
}


module.exports = {
    createLesson,
    getAllLesson,
    deleteLesson,
    findLesson,
    updateLesson
}