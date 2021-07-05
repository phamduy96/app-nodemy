const CoursesModel = require("../models/courses");
const SyllabusModel = require("../models/syllabus");
const _ = require('lodash')

function createCourse(newCourse) {
  return CoursesModel.create(newCourse);
}

function createManyCourses(listCourse) {
    return CoursesModel.insertMany(listCourse);
}

async function createManyCoursesWithOrder(newOrder) {
    let {idAccount, combo, courses} = newOrder
    let listCombo = await SyllabusModel.find({
        _id: {$in : combo}
    })

    let listCourseFromListCombo = listCombo.map(item=>{
        return item.modules
    })

    let listCourse = _.flatten(listCourseFromListCombo).concat(courses)
    listCourse = _.uniqBy(listCourse)

    listCourse = listCourse.map(item=>{
        return {
            account: idAccount,
            module: item
        }
    })
    return CoursesModel.insertMany(listCourse);
}

function findCourseById(id) {
  return CoursesModel.findOne({ _id: id }).populate('account module');
}

function getAllCourses() {
  return CoursesModel.find({}).populate('account module');
}

function getCoursesByCondition(condition) {
  return CoursesModel.find(condition).populate('account module');
}

async function activeManyCourses(idAccount, listCoursesId) {
  listCoursesId = _.uniqBy(listCoursesId)
  listCoursesId = _.compact(listCoursesId) // remove undefiend, falsey value
  return CoursesModel.updateMany({
    account: idAccount,
    module: {$in : listCoursesId}
  }, {
    status: 'active'
  })
}

function updateLessonStatus(idCourse, idLesson, status, complete) {
  let condition = {}
  if(status) condition['result.$.status'] = status
  if(complete) condition['result.$.complete'] = complete
  return CoursesModel.update({
    _id: idCourse,
    'result.idLesson': idLesson
  }, {
    '$set': condition
  });
}

function addLessonStatus(idCourse, idLesson) {
  let newLesson = {
    idLesson: idLesson,
    status: 'studying',
    complete: 0
  }

  return CoursesModel.update({
    _id: idCourse,
    'result.idLesson': { '$ne': idLesson }
  }, {
    '$addToSet': {result: newLesson}
  });
}
function deleteCourse(idAccount, module){
  return CoursesModel.deleteMany({
    account: idAccount,
    module: {$in: module}
  })
}
module.exports = {
  createCourse,
  createManyCourses,
  createManyCoursesWithOrder,
  findCourseById,
  getAllCourses,
  getCoursesByCondition,
  activeManyCourses,
  updateLessonStatus,
  addLessonStatus,
  deleteCourse
};
