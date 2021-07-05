var express = require('express');
var router = express.Router();
const classService = require('../services/class');
const accountService = require('../services/account');
const scoreService = require('../services/score');
const { sendError, sendSuccess } = require('../utils/index');
const checkAuth = require('../Auth/checkAuth');
var {
    SERVER_ERROR,
    NOT_PERMISSON,
    TEACHER_NOT_FOUND,
    CLASS_CREATION_FAILED,
    CLASS_CREATION_SUCCESS,
    CLASS_NOT_FOUND,
    UPDATE_FAILED,
    DELETE_FAILED,
    NOT_A_TEACHER,
    GET_LIST_DATA_CLASS,
    GET_LIST_DATA_FAILED,
    UPDATE_CLASS_SUCCESS,
    DELETE_CLASS_SUCCESS,
    GET_LIST_CLASS_OF_TEACHER,
    CLASS_DETAIL,
    TRANSACTION_SUCCESS,
    TRANSACTION_FAILED,
} = require('../config/error');

router.put('/', checkAuth.checkSaler, async function(req, res, next) {
    try {
        var userInfo = await scoreService.getStudenInfor(req.body.idStudent, req.body.Class)
        var total = userInfo.transaction.reduce((sum, cur) => sum + cur.money, 0)
        var newtotal = parseInt(total) + parseInt(req.body.money)
        if (userInfo.price >= newtotal) {
            let isMoney = userInfo.price == newtotal
            var updateTransaction = await scoreService.updateTransaction(req.body.idStudent, req.body.Class, req.body.money, req.user._id, newtotal, isMoney)
                .populate('idAccount', ['email', 'name'])
                .populate({ path: 'transaction.saler', select: ['name', 'email'] })
            updateTransaction.point = undefined
            updateTransaction.attendance = undefined
            res.status(200).json(sendSuccess(TRANSACTION_SUCCESS, updateTransaction))
        } else {
            res.status(400).json(sendError(TRANSACTION_FAILED))
        }
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})


router.get('/:id', checkAuth.checkSaler, async function(req, res, next) {
    try {
        var studentInClass = await scoreService.getStudentsActiveInClass(req.params.id)
            .populate('idAccount', ['email', 'name'])
            .populate({ path: 'transaction.saler', select: ['name', 'email'] }).exec()
        for (let i = 0; i < studentInClass.length; i++) {
            studentInClass[i]['point'] = undefined;
            studentInClass[i]['attendance'] = undefined;
        }
        res.status(200).json(sendSuccess(null, studentInClass))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }

})

module.exports = router;