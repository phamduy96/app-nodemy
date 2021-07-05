const SyllabusModel = require('../models/syllabus')

function getAllSyllabus(){
    return SyllabusModel.find({})
}

function createSyllabus(title, description, modules){
    return SyllabusModel.create({
        title,
        description,
        modules
    })
}

function deleteSyllabus(id){
    return SyllabusModel.deleteOne({
        _id: id
    })
}

function findSyllabus(id){
    return SyllabusModel.findOne({
        _id: id
    })
}

function updateSyllabus(id, newSyllabus){
    return SyllabusModel.updateOne({
        _id: id
    }, newSyllabus)
}


module.exports = {
    createSyllabus,
    getAllSyllabus,
    deleteSyllabus,
    findSyllabus,
    updateSyllabus
}