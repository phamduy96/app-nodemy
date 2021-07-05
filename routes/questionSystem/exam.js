let express = require('express');
let router = express.Router();
const { sendError, sendSuccess } = require('../../utils/index');
const examService = require('../../services/questionSystem/exam');
const questionService = require('../../services/questionSystem/question');
const scoreService = require('../../services/score');
const classService = require('../../services/class')
const {
    GET_LIST_DATA_SUCCESS,
    GET_LIST_DATA_FAILED,
    UPDATE_SUCCESS,
    UPDATE_FAILED,
    DELETE_SUCCESS,
    DELETE_FAILED,
    CREATE_FAILED,
    CREATE_SUCCESS,
    QUESTION_EXAM_FAILED,
    CLASS_EXAM_FAILED,
    INPUT_FAILED,
    NOT_PERMISSON
} = require('../../config/error');
const account = require('../../services/account');
const AccountModel = require('../../models/accounts');
const ClassModel = require('../../models/class');


// Lấy exam dựa theo status (admin + teach)
router.get('/', async (req, res, next) => {
    if (req.user.role === 'user') {
        return res.status(403).json(sendError(NOT_PERMISSON));
    }
    try {
        let exam = null
        let status = req.query.status;
        if (req.user.role === 'admin') {
            exam = await examService.getExamByStatus(status);
        }
        else {
            let classId = await classService.getByTeacher(req.user._id);
            exam = await examService.getExamByClass(classId[0]._id, status, req.user._id);
        }
        return res.json(sendSuccess(GET_LIST_DATA_SUCCESS, exam));
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});
//Lấy những bài thi của class (teacher)
// router.get('/examByClass', async (req, res, next) => {
//     if (req.user.role === 'user') {
//         return res.status(403).json(sendError(NOT_PERMISSON));
//     }
//     try {
//         let status = req.query.status;

//         let exam = await examService.getExamByClass(status);

//         return res.json(sendSuccess(GET_LIST_DATA_SUCCESS, exam));
//     } catch (error) {
//         return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
//     }
// });
// get exam maker (admin + teach + thí sinh trong exam)
router.get('/exam-maker/:id', async (req, res, next) => {
    try {
        let examId = req.params.id;
        let studentId = req.user._id;
        // Chỉ admin, teach và học viên được thêm trong exam mới có quyền
        let permision = false;
        if (req.user.role !== 'user') permision = true;
        if (req.user.role == 'user' && await examService.checkStudent(examId, studentId)) permision = true;
        if (permision) {
            let examMaker = await examService.getExamMaker(examId);
            return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, examMaker));
        } else {
            return res.status(403).json(sendError(NOT_PERMISSON));
        }
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});


// Lấy exam cho một học viên dựa theo userId lưu trong ram và status 
router.get('/student', async (req, res, next) => {
    try {
        let status = parseInt(req.query.status);
        let userId = req.user._id;
        let exam = await examService.readUser(userId, status);
        return res.json(sendSuccess(GET_LIST_DATA_SUCCESS, exam));
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});
// Tạo exam mới (admin + teacher) 
router.post('/', async (req, res, next) => {
    if (req.user.role === 'user') {
        return res.status(403).json(sendError(NOT_PERMISSON));
    }
    try {
        let { name, moduleId, classId, maxQuestionNumber, minute } = req.body;
        maxQuestionNumber = parseInt(maxQuestionNumber);
        minute = parseInt(minute);
        let questions = await questionService.filteByModule(moduleId, maxQuestionNumber);
        let students = await scoreService.getStudentsActiveInClass(classId);
        students = students.map(student => student.idAccount);
        if (
            !name || !moduleId ||
            !classId || !maxQuestionNumber || !minute ||
            typeof maxQuestionNumber !== 'number' ||
            typeof minute !== 'number' ||
            maxQuestionNumber < 1 || minute < 1
        ) {
            return res.status(500).json(sendError(INPUT_FAILED))
        }

        if (questions.length == 0) {
            return res.status(500).json(sendError(QUESTION_EXAM_FAILED))
        }

        if (students.length == 0) {
            return res.status(500).json(sendError(CLASS_EXAM_FAILED))
        }

        let teacher = await account.getTeacherByClassId(classId);
        let newExam = {
            name: name,
            minute: parseInt(minute),
            question: questions,
            student: students,
            class: classId,
            teacher: teacher
        }
        let data = await examService.create(newExam);
        return res.json(sendSuccess(CREATE_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(error));
    }
});

// tạo bài thi thử (student)
router.post("/studentTest", async (req, res) => {
    if (req.user.role === 'user') {
        var isOfficial = false;
    }
    try {
        let { name, moduleId, maxQuestionNumber, minute } = req.body;
        maxQuestionNumber = parseInt(maxQuestionNumber);
        minute = parseInt(minute);
        let questions = await questionService.createPracticeExam(moduleId, maxQuestionNumber);
        // let students = await scoreService.getStudentsActiveInClass(classId);
        students = [req.user._id];
        if (
            !name || !moduleId ||
            !maxQuestionNumber || !minute ||
            typeof maxQuestionNumber !== 'number' ||
            typeof minute !== 'number' ||
            maxQuestionNumber < 1 || minute < 1
        ) {
            return res.status(500).json(sendError(INPUT_FAILED))
        }
        if (questions.length == 0) {
            return res.status(500).json(sendError(QUESTION_EXAM_FAILED))
        }
        if (students.length == 0) {
            return res.status(500).json(sendError(CLASS_EXAM_FAILED))
        }
        let newExam = {
            name: name,
            minute: parseInt(minute),
            question: questions,
            student: students,
            class: "Unofficial Test",
            teacher: req.user._id,
            isOfficial: false
        }
        let data = await examService.create(newExam);
        return res.json(sendSuccess(CREATE_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(error));
    }
})

// Cập nhật status cho exam (admin + teacher)
router.put('/update-status/:id', async (req, res, next) => {

    try {
        let examId = req.params.id;
        let status = req.body.status;
        let data = await examService.editStatus(examId, status);
        return res.json(sendSuccess(UPDATE_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(UPDATE_FAILED));
    }
});

// delete exam by id exam (admin + teacher)>><
router.delete('/:id', async (req, res, next) => {
    if (req.user.role === 'user') {
        return res.status(403).json(sendError(NOT_PERMISSON));
    }
    try {
        let examId = req.params.id;
        let data = await examService.remove({ _id: examId });
        return res.json(sendSuccess(DELETE_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(DELETE_FAILED));
    }
});

module.exports = router;