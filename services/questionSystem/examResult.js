const ResultModel = require('../../models/questionSystem/examResult');
const QuestionService = require('./question');
const ExamService = require('./exam');
const ClassService = require('../class');

async function findTrueAnswerNumber(student_answer_list) {
    let trueAnswerNumber = 0;
    let question_list = await getQuestionList(student_answer_list);
    student_answer_list.forEach((answer, i) => {
        let question = question_list.filter(q => q._id == answer.question)[0];
        trueAnswerNumber += isTrueAnswer(answer, question) ? 1 : 0;
    });
    return trueAnswerNumber;
}
function getQuestionList(student_answer_list) {
    let idArray = student_answer_list.map(a => a.question);
    return QuestionService.getAnswer(idArray);
}
function isTrueAnswer(answer, question) {
    let studentAnswer = answer.answer_list;
    let trueAnswer = question.answer;
    return QuestionService.compareAnswer(studentAnswer, trueAnswer);
}

async function findTotalQuestionNumber(examId) {
    let exam = await ExamService.findExamById(examId);
    return exam.question.length;
}

function createExamResult(docs) {
    return ResultModel.create(docs);
}

async function isExsitExamResult(studentId, examId) {
    let result = await ResultModel.findOne({ student: studentId, exam: examId });
    if (result) return true;
    return false;
}

async function getResultDetail(examId) {
    let exam = await getExamById(examId).populate('student', '_id avatar name email');
  
    let classInfo = await getClassById(exam.class);
    let examResutlList = await getExamResultList(examId);
    return {
        exam: exam,
        examResutlList: examResutlList,
        classInfo: classInfo
    }
}

function getExamById(id) {
    return ExamService.findExamById(id);
}

// lấy tất cả kết quả thi có examId được cho
function getExamResultList(examId) {
    return ResultModel.find({ exam: examId }).populate('student', '_id avatar name email');
}

function getClassById(id) {
    return ClassService.getClassById(id);
}

async function getEndedExam(resultId) {
    let result = await ResultModel.findById(resultId).populate('student')
    let exam = await ExamService.findExamById(result.exam).populate('question')
    return {
        examResult: result,
        exam: exam
    }
}

async function getHistoryOfStudent(studentId, searchString) {
    let history = await ResultModel.find({ student: studentId }).populate('exam').sort({ updatedAt: -1 });
    let removedExamNotEnd = history.filter(result => (result.exam && result.exam.status === 1))
    if (searchString) removedExamNotEnd = filterHistoryOfStudent(searchString, removedExamNotEnd)
    return removedExamNotEnd
}

function filterHistoryOfStudent(searchString, listResult) {
    return listResult.filter(result => {
        let resultName = result.exam.name
        regexp = new RegExp(searchString, "i");
        if (regexp.test(resultName))
            return true
        return false
    })

}

async function validExam(examId) {
    if (await findStatusExam(examId) === 0)
        return true
    return false
}

async function findStatusExam(examId) {
    const exam = await getExamById(examId)
    return exam.status
}

module.exports = {
    findTrueAnswerNumber,
    findTotalQuestionNumber,
    createExamResult,
    isExsitExamResult,
    getResultDetail,
    getEndedExam,
    getHistoryOfStudent,
    validExam
}