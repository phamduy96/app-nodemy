let express = require('express');
let router = express.Router();
const { sendError, sendSuccess } = require('../../utils/index');
const questionService = require('../../services/questionSystem/question');
const {
    GET_LIST_DATA_FAILED,
    GET_LIST_DATA_SUCCESS,

} = require('../../config/error');
const CREATE_FAILED = {
    statusCode: 500,
    message: 'CREATE FAILED'
}
const CREATE_SUCCESS = {
    statusCode: 200,
    message: 'CREATE SUCCESS'
}
const UPDATE_FAILED = {
    statusCode: 500,
    message: 'UPDATE FAILED'
}
const UPDATE_SUCCESS = {
    statusCode: 200,
    message: 'UPDATE SUCCESS'
}
const DELETE_SUCCESS = {
    statusCode: 200,
    message: 'DELETE SUCCESS'
}
const DELETE_FAILED = {
    statusCode: 500,
    message: 'DELETE FAILED'
}

router.get('/', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let { moduleId, searchString } = req.query;
        let query = {};
        if (searchString) {
            query = { $text: { $search: req.query.searchString } };
        }
        if (moduleId) {
            query.module = { $in: [moduleId] };
        }
        if (req.user.role !== "user") {
            data = await questionService.readAtPage(query, page, limit);
        }
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});

router.get('/show-all', async (req, res, next) => {
    try {
        if (req.user.role !== "user") {
            data = await questionService.readAll();
        }
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, data));
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});


router.post('/', async (req, res, next) => {
    try {
        let question = {
            description: req.body.description,
            question: req.body.question,
            answer: req.body.answer,
            explain: req.body.explain || "",
            module: req.body.module || []
        }
        if (req.user.role !== 'user') {
            data = await questionService.create(question);
            return res.status(200).json(sendSuccess(CREATE_SUCCESS, data));
        } else {
            return res.status(500).json(sendError(CREATE_FAILED));
        }
    } catch (error) {
        return res.status(500).json(sendError(CREATE_FAILED));
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        let questionId = req.params.id;
        let question = {
            description: req.body.description,
            question: req.body.question,
            answer: req.body.answer,
            explain: req.body.explain || "",
            module: req.body.module || []
        }
        if (req.user.role !== 'user') {
            data = await questionService.update({ _id: questionId }, question);
            return res.status(200).json(sendSuccess(UPDATE_SUCCESS, data));
        } else {
            return res.status(500).json(sendError(UPDATE_FAILED));
        }
    } catch (error) {
        return res.status(500).json(sendError(UPDATE_FAILED));
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        let questionId = req.params.id;
        if (req.user.role !== 'user') {
            data = await questionService.remove({ _id: questionId });
            return res.status(200).json(sendSuccess(DELETE_SUCCESS, data));
        } else {
            return res.status(500).json(sendError(DELETE_FAILED));
        }
    } catch (error) {
        return res.status(500).json(sendError(DELETE_FAILED));
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        let questionId = req.params.id;
        if (req.user.role !== 'user') {
            let question = await questionService.read({ _id: questionId });
            return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, question));
        } else {
            return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
        }
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});

module.exports = router;