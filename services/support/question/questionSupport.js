let QuestionSupportModel = require("../../../models/support/question/questionSupport");
let { increaseTicketOfUser, minusTicketOfUser } = require("../../../services/account");
const imageQueue = require('../../../queue/media').imageQueue

module.exports.createQuestionSupport = async (data, user) => {
    try {
        var result = await minusTicketOfUser(user._id);
        if(!result){
            throw "Không đủ ticket"
        }else{
            await QuestionSupportModel.create(data);
        }
    } catch (error) {
        throw {
            message: error || "Tạo câu hỏi không thành công"
        }
    }
}

function listQuestionReview(condition){
    condition.status = "review";
    return QuestionSupportModel
    .find(condition)
    .populate({
        path: 'idStudent',
        select: { "password": 0}
    })
    .populate({
        path: "idTeacher",
        select: { "password": 0}
    })
    .sort({timeBook: 1})
    .exec();
}

function listQuestionDone(condition){
    condition.status = "done";
    return QuestionSupportModel
    .find(condition)
    .populate({
        path: 'idStudent',
        select: { "password": 0}
    })
    .populate({
        path: "idTeacher",
        select: { "password": 0}
    })
    .sort({timeBook: 1})
    .exec();
}
//hiển thị toàn bộ câu hỏi theo status và theo mọi quyền
module.exports.getAllQuestionSupport = (user) => {
    let condition = {};
    if(user.role === "user" || user.role === "saler") condition.idStudent = user._id;
    if(user.role === "teacher") condition.idTeacher = user._id;
    let listQuestionReviewProccess = listQuestionReview(condition)
    let listQuestionDoneProccess = listQuestionDone(condition)                 
    return Promise.all([listQuestionReviewProccess, listQuestionDoneProccess])
}

//cập nhật trạng thái của câu hỏi khi người dùng kết thúc câu hỏi hỗ trợ
module.exports.doneReviewQuestionSupport = async (idQuestion) => {
    try {
        let questionSupport = await QuestionSupportModel.findByIdAndUpdate(idQuestion, { status: "done", doneAt: new Date() }, { new: true });
        if(questionSupport.status === "done"){
            return increaseTicketOfUser(questionSupport.idTeacher);
        }
    } catch (error) {
        throw{
            message: "Cập nhật không thành công"
        }
    }
}

module.exports.updateSolution = async (idQuestion, solution) => {
    return QuestionSupportModel.findByIdAndUpdate(idQuestion, { solution }, { new: true });
}

module.exports.updateQuestion = async (idQuestion, newQuestion) => {
    return QuestionSupportModel.findByIdAndUpdate(idQuestion, newQuestion, { new: true });
}

module.exports.destroyQuestionSupport = async (idQuestion, idStudent) => {
    try {
        var deletedQuestion = await QuestionSupportModel.findOneAndRemove({_id: idQuestion, solution: {$in : [null, ""]}});
        if(!deletedQuestion) throw "Câu hỏi đã có đáp án"
        imageQueue.add({questionID: idQuestion, listImage: deletedQuestion.imageQuestion}, {
            removeOnComplete: true
        })
        await increaseTicketOfUser(idStudent);
        return {
            message: "Xóa câu hỏi thành công"
        }
    } catch (error) {
        throw{
            message: error || "Xóa câu hỏi không thành công"
        }
    }

}

module.exports.findQuestionById= (idQuestion) => {
    return QuestionSupportModel.findOne({_id: idQuestion})
            .populate({
                path: 'idStudent',
                select: { "password": 0}
            })
            .populate({
                path: "idTeacher",
                select: { "password": 0}
            })
            .exec();
}