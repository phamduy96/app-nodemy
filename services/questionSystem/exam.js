let ExamModel = require('../../models/questionSystem/exam');

function readByStatus(status) {
  return ExamModel
    .find({ status: status })
    .sort({ updatedAt: -1 });
}
async function getExamByClass(classId, status, teacher) {
  return ExamModel
    .find({ status: status })
    .populate({
      path: 'class',
      match: { teacher: teacher }
    })
    .sort({ updatedAt: -1 });
}

function getExamByStatus(status) {
  return ExamModel
    .find({ status: status })
    .sort({ updatedAt: -1 });
}


function create(newExam) {
  return ExamModel
    .create(newExam);
}
function editStatus(id, newStatus) {
  return ExamModel
    .updateOne({ _id: id }, { status: newStatus });
}
function remove(query) {
  return ExamModel.deleteOne(query);
}
function readUser(userId, status) {
  return ExamModel
    .find(
      {
        $and: [
          { student: { $in: [userId] } },
          { status }]
      })
    .sort({ updatedAt: -1 });
}
async function getExamMaker(examId) {
  let examMaker = await ExamModel
    .findById(examId)
    .populate('question');

  // Vì đối tượng do mongodb trả về không thể thay đổi nên ta cần dòng code này
  examMaker = examMaker.toObject();

  examMaker.question.forEach(ques => {
    let correctNumber = ques.answer.filter(ans => ans.result == true);
    if (correctNumber.length > 1) {
      ques.multiResult = true
    } else {
      ques.multiResult = false
    }
    ques.answer.forEach(ans => ans.result = null);
    ques.explain = null;
  });
  return examMaker;
}
async function checkStudent(examId, studentId) {
  let exam = await ExamModel.findById(examId);
  return exam.student.includes(studentId);
}

function findExamById(id) {
  return ExamModel.findById(id);
}




module.exports = {
  readUser,
  editStatus,
  readByStatus,
  create,
  remove,
  getExamMaker,
  checkStudent,
  findExamById,
  getExamByClass,
  getExamByStatus

}
