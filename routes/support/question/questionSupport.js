var router = require("express").Router();
var { 
    createQuestionSupport, 
    getAllQuestionSupport, 
    doneReviewQuestionSupport, 
    updateQuestion,
    destroyQuestionSupport,
    findQuestionById
} = require("../../../services/support/question/questionSupport");
const { sendError, sendSuccess } = require('../../../utils/index');
var { SERVER_ERROR } = require('../../../config/error');
const { checkDir }=require("../../../services/uploadImage/checkDir")
const { createImageQuestionSupport }=require("../../../services/uploadImage");
const { checkAuth } = require('../../../Auth/checkAuth');
const { 
    checkExistQuestionSupport, 
    checkDeleteQuestionPermission, 
    checkUpdateQuestionPermission,
    checkStatusOfQuestion 
} = require('../../../middleware/questionSupport');

var fs = require('fs');
let path = require('path')
router.use(checkAuth);
router.post("/", async (req, res, next) => {
    try {
        await createQuestionSupport(req.body, req.user);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Tạo câu hỏi thành công'
        }))
    } catch (error) {
        if(error.message){
            return res.status(403).json(sendError({
                statusCode: 403,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));

    }
})

router.post("/upload-image-question", (req, res, next) => {
    checkDir();
    createImageQuestionSupport(req, res);
});
router.get("/:idQuestion", async (req, res) => {
    try {
        var listQuestion = await findQuestionById(req.params.idQuestion);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Hiển thị câu hỏi thành công'
        }, listQuestion))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));

    }
})
router.get("/", async (req, res, next) => {
    try {
        var listQuestion = await getAllQuestionSupport(req.user);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Hiển thị câu hỏi thành công'
        }, listQuestion))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));

    }
})

//xóa link ảnh câu hỏi
router.delete("/unlink-image-question", async function(req, res){
    let handleLinkImage = (link) =>{
        let condition = process.env.NODE_ENV === "production" ? process.env.DOMAIN : process.env.HOST_DOMAIN_DEV
        return path.join(__dirname, "../../../"+link.trim().split(""+condition)[1])
    }

    try {
        let linkImage = req.body.linkImage; 
        // case array image
        if(Array.isArray(linkImage)){
            for(let i = 0; i < linkImage.length; i++){
                if(fs.existsSync(handleLinkImage(linkImage[i]))){
                    fs.unlinkSync(handleLinkImage(linkImage[i]));
                }
            }
            return res.status(200).json(sendSuccess({
                statusCode: 200,
                message: 'Xoá ảnh thành công'
            }))
        }

        // case single image
        if(fs.existsSync(handleLinkImage(linkImage))) fs.unlinkSync(handleLinkImage(linkImage));
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Xoá ảnh thành công'
        }))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})

router.put("/done/:idQuestion", async (req, res, next) => {
    try {
        let data = await doneReviewQuestionSupport(req.params.idQuestion);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Kết thúc câu hỏi thành công'
        }, data))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));

    }
})

router.put("/:idQuestion",  checkExistQuestionSupport, checkUpdateQuestionPermission, async (req, res, next) => {
    try {
        let newQuestion = {}
        if(req.body.solution) newQuestion.solution = req.body.solution
        if(req.body.description) newQuestion.description = req.body.description
        if(req.body.idStudent) newQuestion.idStudent = req.body.idStudent
        if(req.body.idTeacher) newQuestion.idTeacher = req.body.idTeacher
        if(req.body.timeBook) newQuestion.timeBook = req.body.timeBook
        if(req.body.tags && req.body.tags.length > 0) newQuestion.tags = req.body.tags
      
        let data = await updateQuestion(req.params.idQuestion, newQuestion);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Cập nhật câu hỏi thành công'
        }, data))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));

    }
})


router.delete("/:idQuestion", checkExistQuestionSupport, checkStatusOfQuestion, checkDeleteQuestionPermission, async (req, res, next) => {
    try {
        await destroyQuestionSupport(req.params.idQuestion, req.questionSupport.idStudent._id);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Xóa câu hỏi thành công'
        }))
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR));
    }
})


module.exports = router