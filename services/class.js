var classModel = require('../models/class');
var accountService = require('./account');
var syllabusService = require('./syllabus')
var {
  GET_LIST_DATA_FAILED,
  TEACHER_NOT_FOUND
} = require('../config/error');
function getAll() {
  return classModel.find().populate("idSyllabus").populate("teacher").exec();
}

function createClass(nameClass, idTeacher, idSyllabus, time, dayStart, dayEnd) {
  return classModel.create({
    name: nameClass,
    teacher: idTeacher,
    idSyllabus: idSyllabus,
    time: time,
    dayStart: new Date(dayStart),
    dayEnd: new Date(dayEnd)
  });
}

function checkID(id) {
  var result = classModel.findById({ _id: id });
  return result;
}

function editClass(id, classInfo) {
  return classModel.updateOne({ _id: id }, classInfo, { new: true });
}

async function updateClass(id, nameClass, teacherId, idSyllabus, time, dayStart, dayEnd) {
  var updatedInfo = {};
  if (nameClass) {
    updatedInfo.name = nameClass;
  }
  if (teacherId) {
    var teacher = await accountService.getUser(teacherId);
    if (teacher.length && teacher[0].role == 'teacher') {
      updatedInfo.teacher = teacher[0]._id;
    } else {
      throw {
        error: true,
        meesage: TEACHER_NOT_FOUND
      }
    }
  }
  if (idSyllabus) {
    var syllabusData = await syllabusService.findSyllabus(idSyllabus);
    if (!syllabusData) {
      throw {
        error: true,
        meesage: GET_LIST_DATA_FAILED
      }
    } else {
      updatedInfo.idSyllabus = idSyllabus;
    }
  }
  if (time) {
    updatedInfo.time = time;
  }
  if (dayStart) {
    updatedInfo.dayStart = dayStart;
  }
  if (dayEnd) {
    updatedInfo.dayEnd = dayEnd;
  }
  return classModel.updateOne({ _id: id }, updatedInfo, { new: true });
}

function deleteClass(id) {
  return classModel.deleteOne({ _id: id });
}

function getclass(nameClass) {
  return classModel.find({ name: nameClass });
}

function getByTeacher(teacher) {
  return classModel.find({ teacher: teacher });
}
function getTeacher(teacher) {
  return classModel.find({ teacher: teacher });
}

async function getClassByIdTeacher(idTeacher) {
  var nameClass = [];
  var data = await getTeacher(idTeacher).populate('teacher', ['_id', 'name']).populate("idSyllabus").exec();
  for (let j = 0; j < data.length; j++) {
    nameClass.push(data[j]);
  }
  return nameClass;
}

function getClassById(id) {
  return classModel.findById(id).populate('teacher').populate('idSyllabus');
}


module.exports = {
  createClass,
  getclass,
  getAll,
  getByTeacher,
  editClass,
  checkID,
  deleteClass,
  getClassByIdTeacher,
  updateClass,
  getClassById,
  getTeacher
};
