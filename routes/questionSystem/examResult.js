let express = require('express');
let router = express.Router();
const { sendError, sendSuccess } = require('../../utils/index');
let resultService = require('../../services/questionSystem/examResult');
let examService =  require('../../services/questionSystem/exam');
const {
    GET_LIST_DATA_SUCCESS,
    CREATE_SUCCESS,
    NOT_PERMISSON,
    SERVER_ERROR,
} = require('../../config/error');

const SENT_FAIL = {
    statusCode: 400,
    message: 'Bạn đã gửi bài rồi'
}

const EXAM_FAIL = {
    statusCode: 400,
    message: 'Giảng viên đã thu bài, bạn không thể nộp bài'
}

// Lưu kết quả của học sinh 
router.post('/', async (req, res, next) => {
    try {
      
        let studentId = req.user._id;
        let { examId, studentResult, timeFinishExam } = req.body;
        let trueAnswerNumber = await resultService.findTrueAnswerNumber(studentResult);
        let totalQuestionNumber = await resultService.findTotalQuestionNumber(examId);

        if (await resultService.validExam(examId)  !== true)
           {   
            return res.json(sendError(EXAM_FAIL));
           }
        if (await resultService.isExsitExamResult(studentId, examId))
            return res.json(sendError(SENT_FAIL));
        let newExamResult = {
            type_exam: 'EXAM',
            exam: examId,
            student: studentId,
            student_result: studentResult,
            time_finish_exam: timeFinishExam,
            true_answer_number: trueAnswerNumber,
            total_question_number: totalQuestionNumber
        }
        let response = await resultService.createExamResult(newExamResult);
        if (response) {
            let data = {
                timeFinishExam: timeFinishExam,
                trueAnswerNumber: trueAnswerNumber,
                totalQuestionNumber: totalQuestionNumber,
                wrongAnswerNumber: totalQuestionNumber - trueAnswerNumber
            }
            return res.status(200).json(sendSuccess(CREATE_SUCCESS, data));
        }
        else
            return res.status(500).json(sendError(SERVER_ERROR));
    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})
//Lưu kết quả của bài thi thử 
router.post('/studentTest', async (req, res, next) => {
    try {
        let studentId = req.user._id;
        let { examId, studentResult, timeFinishExam } = req.body;
        let trueAnswerNumber = await resultService.findTrueAnswerNumber(studentResult);
        let totalQuestionNumber = await resultService.findTotalQuestionNumber(examId);
        if (await resultService.validExam(examId)  !== true)
           {   
            return res.json(sendError(EXAM_FAIL));
           }
        if (await resultService.isExsitExamResult(studentId, examId))
            return res.json(sendError(SENT_FAIL));
        let newExamResult = {
            type_exam: 'EXAM',
            exam: examId,
            student: studentId,
            student_result: studentResult,
            time_finish_exam: timeFinishExam,
            true_answer_number: trueAnswerNumber,
            total_question_number: totalQuestionNumber
        }
        let response = await resultService.createExamResult(newExamResult);
        if (response) {
            let data = {
                timeFinishExam: timeFinishExam,
                trueAnswerNumber: trueAnswerNumber,
                totalQuestionNumber: totalQuestionNumber,
                wrongAnswerNumber: totalQuestionNumber - trueAnswerNumber
            }
              let isUpdate = await examService.editStatus(examId, 1);
            return res.status(200).json(sendSuccess(CREATE_SUCCESS, data));
        }
        else
            return res.status(500).json(sendError(SERVER_ERROR));
    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})
// Lấy nội dung chi tiết của một exam (chi admin, teacher)
router.get('/exam/:examId', async (req, res, next) => {
    try {
        if (req.user.role === 'user')
            return res.status(400).json(sendError(NOT_PERMISSON));
        let resultDetail = await resultService.getResultDetail(req.params.examId);
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, resultDetail));
    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})

// Lấy toàn bộ kết quả bài thi của 1 học viên (quyền cho admin, teacher và người làm bài )
router.get('/history', async (req, res, next) => {
    try {
        let history = await resultService.getHistoryOfStudent(req.user._id, req.query.searchString );
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, history));

    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }

})

// Lấy một kết quả dựa theo id được cho (tất cả mọi người đều có quyền truy cập) 
router.get('/:id', async (req, res, next) => {
    try {
        let endedExam = await resultService.getEndedExam(req.params.id);
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, endedExam));
    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})

module.exports = router;