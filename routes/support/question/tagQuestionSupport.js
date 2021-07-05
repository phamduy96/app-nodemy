var router = require("express").Router();
var { createTagQuestionSupport, getAllTagQuestionSupport } = require("../../../services/support/question/tagQuestionSupport");
const { sendError, sendSuccess } = require('../../../utils/index');
var { SERVER_ERROR } = require('../../../config/error');

router.get("/", async (req, res) => {
    try {
        var listTag = await getAllTagQuestionSupport();
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Hiển thị tag câu hỏi thành công'
        }, listTag));
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.post("/", async (req, res, next) => {
    try {
        await createTagQuestionSupport(req.body);
        return res.status(200).json(sendSuccess({
            statusCode: 200,
            message: 'Tạo tag câu hỏi thành công'
        }));
    } catch (error) {
        if(error.message){
            return res.status(400).json(sendError({
                statusCode: 400,
                message: error.message
            }))
        }
        return res.status(500).json(sendError(SERVER_ERROR))
    }
})

module.exports = router
