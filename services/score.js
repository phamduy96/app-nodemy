var scoreModel = require('../models/scores')
const classService = require('../services/class')
const syllabusService = require('../services/syllabus');

async function createScores(idClass, listStudentsId) {
    let classSyllabus= await classService.checkID(idClass)
    let syllabus = await syllabusService.findSyllabus(classSyllabus.idSyllabus).populate("modules").populate({path:"modules",  populate: { path: 'lessons' }});
    let lessons=[]
    let points=[]
    var countModule = 0;
    syllabus.modules.forEach((moduleItem, index) => {
        for(let i=0 ;i < moduleItem.lessons.length ; i++){
            lessons.push({attend: 4, lesson: countModule, idlesson: moduleItem.lessons[i], note: null, date: null});
            countModule = countModule + 1;
        }

        for(let i=0 ;i < moduleItem.points.length ; i++){
            points.push({
                module: moduleItem._id,
                title: moduleItem.points[i].title,
                level: moduleItem.points[i].level,
                point: 0, 
                date: null,
                note: ''
            });
        }
    });
   
    listStudentsId = listStudentsId.map(studentId=>{
        return {
            idAccount: studentId,
            idClass: idClass,
            attendance: lessons,
            point: points
        }
    })
    return scoreModel.insertMany(listStudentsId)
}



function updateScore(idStudent, idClass, point, comment) {
    // return scoreModel.updateOne({ _id: id }, scoreInfo, { new: true }),F
    return scoreModel.updateOne({
        idClass: idClass,
        idAccount: idStudent
    }, {
        $push: {
            point: {
                point: point,
                comment: comment,
                date: Date.now()
            }
        }
    })
}
async function addUsersToClass(idClass, listStudentsId) {

    return createScores(idClass, listStudentsId)
}

function getStudentsActiveInClass(id) {
    return scoreModel.find({ idClass: id, status: 1 });
}

function getAllStudentsInClass(id) {
    return scoreModel.find({ idClass: id });
}

function getClassOfStudent(idStudent) {
    return scoreModel.find({ idAccount: idStudent }, '_id idClass')
    .populate({ 
        path: 'idClass', 
        populate: [{path: "idSyllabus"},{ path: 'teacher', select: { 'name': 1}}],
    })
    .exec();
}

function updateStatusStudentsInClass(listIdStudents, idClass, status = 0){
    var condition = {
        idClass: idClass
    }
    // if listIdStudents is String => update one
    // else listIdStudents is array => update many
    if( typeof listIdStudents === 'string' ){
        condition.idAccount = listIdStudents
    }else {
        condition.idAccount = { $in: listIdStudents }
    }

    return scoreModel.updateMany(condition, {
        status: status
    })
}

function attendStudentsWithLesson(listIdStudents, idClass, infoAttend){
    var {lesson, statusAttend, note, idLesson} = infoAttend
    var condition = {
        idClass: idClass,
        'attendance.idlesson': idLesson
    }

    // if listIdStudents is String => update one
    // else listIdStudents is array => update many
    if( typeof listIdStudents === 'string' ){
        condition.idAccount = listIdStudents
    }else {
        condition.idAccount = { $in: listIdStudents }
    }

    let newInfo = {
        'attendance.$.attend': statusAttend,
        'attendance.$.date': Date.now()
    }
    //note is optional
    if(note) {
        newInfo['attendance.$.note'] = note
    }

    return scoreModel.updateMany(condition, {
        $set: newInfo
    })
}

async function updatePointOfStudent(infoPoint, idClass){
    var {point, idPoint} = infoPoint
    var condition = {
        idClass: idClass,
        "point._id": idPoint
    }
    return scoreModel.updateOne(condition, {
        "point.$.point": parseInt(point)
    })
}

function getAllScoreOfClass(idClass, idStudent){
    return scoreModel.find({ idClass, idAccount: idStudent })
}

function getAllUserOfClass(idClass){
    return scoreModel.find({ idClass }).populate('idAccount', ['_id', 'name', 'avatar', 'email']);
}
function getAllScoreOfUser(idUser){
    return scoreModel.find({ idAccount: idUser }).populate("idClass")
}

function deleteStudentFromClass(idClass, idStudent) {
    return scoreModel.deleteMany({idClass: idClass, idAccount: idStudent})
}

module.exports = {
    createScores: createScores,
    updateScore: updateScore,
    getStudentsActiveInClass,
    getAllStudentsInClass,
    getClassOfStudent,
    addUsersToClass,
    updateStatusStudentsInClass,
    attendStudentsWithLesson,
    updatePointOfStudent,
    getAllScoreOfClass,
    getAllUserOfClass,
    getAllScoreOfUser,
    deleteStudentFromClass
    // updateTransaction,
    // updateTotalMoney,
    // updateIsMoney,
    // getStudenInfor
}