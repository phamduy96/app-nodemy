const { sendError } = require('../utils/index');
const { findQuestionById } = require("../services/support/question/questionSupport");
module.exports.checkExistQuestionSupport = async (req, res, next) => {
    let questionSupport = await findQuestionById(req.params.idQuestion);
    if(!questionSupport){
        return res.status(400).json(sendError({
            statusCode: 400,
            message: "Câu hỏi hỗ trợ không tồn tại"
        }))
    }
    req.questionSupport = questionSupport
    next();
}

module.exports.checkDeleteQuestionPermission = (req, res, next) => {
    if((String(req.questionSupport.idStudent._id) === String(req.user._id)) || req.user.role === "admin"){
        return next();
    }
    return res.status(400).json(sendError({
        statusCode: 400,
        message: "Bạn không có quyền xóa với câu hỏi này"
    }))
}

module.exports.checkUpdateQuestionPermission = (req, res, next) => {
    if((String(req.questionSupport.idStudent._id) === String(req.user._id)) || (String(req.questionSupport.idTeacher._id) === String(req.user._id)) || req.user.role === "admin"){
        return next();
    }
    return res.status(400).json(sendError({
        statusCode: 400,
        message: "Bạn không có quyền cập nhật với câu hỏi này"
    }))
}

module.exports.checkStatusOfQuestion = (req, res, next) => {
    if(req.questionSupport.status === "done"){
        return res.status(400).json(sendError({
            statusCode: 400,
            message: "Câu hỏi đã được hỗ trợ do vậy không thể xóa"
        }))
    }
    next();
}
