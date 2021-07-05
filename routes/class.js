var express = require('express');
var router = express.Router();
const classService = require('../services/class');
const accountService = require('../services/account');
const scoreService = require('../services/score');
const { sendError, sendSuccess } = require('../utils/index');
const { attendOnTime, noAttendance, attendLate } = require("../utils/score-user/attendance.js")
const checkAuth = require('../Auth/checkAuth');
var {
    SERVER_ERROR,
    TEACHER_NOT_FOUND,
    CLASS_CREATION_FAILED,
    CLASS_CREATION_SUCCESS,
    NOT_A_TEACHER,
    GET_LIST_DATA_CLASS,
    GET_LIST_DATA_FAILED,
    UPDATE_CLASS_SUCCESS,
    DELETE_CLASS_SUCCESS,
    GET_LIST_CLASS_OF_TEACHER,
    CLASS_DETAIL,
    INVALID_INPUT,
    UPDATE_FAILED,
} = require('../config/error');

//get all class
router.get('/', async function (req, res, next) {
    var classes = null;
    try {
        if (req.user.role == 'admin') {
            classes = await classService.getAll();
        }

        if (req.user.role == 'teacher') {
            classes = await classService.getClassByIdTeacher(req.user._id);
        }

        if (req.user.role == 'user') {
            classes = await scoreService.getClassOfStudent(req.user._id);
            classes = classes.filter(item => {
                return item.idClass !== null
            })
        }
        return res.status(200).json(sendSuccess(GET_LIST_DATA_CLASS, classes));
    } catch (error) {
        return res.status(500).json(sendError(GET_LIST_DATA_FAILED));
    }
});

//create class(admin + teacher)
router.post('/', checkAuth.checkAuth, checkAuth.checkTeacher, async function (req, res, next) {
    try {
        if (req.user.role == 'admin') {
            var getUser = await accountService.getUser(req.body.emailTeacher);
            var classed = await classService.createClass(req.body.nameClass, getUser[0]._id, req.body.idSyllabus, req.body.time, req.body.dayStart, req.body.dayEnd);
            if (classed) {
                return res.status(200).json(sendSuccess(CLASS_CREATION_SUCCESS, classed));
            } else {
                return res.status(400).json(sendError(CLASS_CREATION_FAILED));
            }
        }
        if (req.user.role == 'teacher') {
            var classed = await classService.createClass(req.body.nameClass, req.user._id, req.body.idSyllabus, req.body.time, req.body.dayStart, req.body.dayEnd);
            if (classed) {
                return res.status(200).json(sendSuccess(CLASS_CREATION_SUCCESS, classed));
            } else {
                return res.status(400).json(sendError(CLASS_CREATION_FAILED));
            }
        }
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR));
    }
});

//updateClass
router.put('/:id', checkAuth.checkTeacher, checkAuth.checkTeacherInClass, async function (
    req,
    res,
    next,
) {
    try {
        var updateClass = await classService.updateClass(req.params.id, req.body.nameClass, req.body.email, req.body.idSyllabus, req.body.time, req.body.dayStart, req.body.dayEnd);
        if (!updateClass) {
            return res.status(400).json(sendError(NOT_A_TEACHER));
        } else {
            return res.status(200).json(sendSuccess(UPDATE_CLASS_SUCCESS, updateClass));
        }
    } catch (err) {
        if (err.error) {
            return res.status(500).json(sendError(err.meesage));
        }
        return res.status(400).json(sendError(UPDATE_FAILED));
    }
});

//delete class
router.delete('/:id', checkAuth.checkTeacher, checkAuth.checkTeacherInClass, async function (
    req,
    res,
    next,
) {
    var resutl = await classService.deleteClass(req.params.id);
    return res.status(200).json(sendSuccess(DELETE_CLASS_SUCCESS, resutl));
});

//lớp đang dạy của giảng viên
router.get('/of-teacher/:id', checkAuth.checkTeacher, async function (req, res, next) {
    // TODO : chú ý, hiện tại mọi giáo viên đều xem được lớp của nhau, cần fix nếu chính sách thay đổi
    var classes = await classService.getClassByIdTeacher(req.params.id);
    return res.status(200).json(sendSuccess(GET_LIST_CLASS_OF_TEACHER, classes));
});

// Class detail(giảng viên và học sinh của lớp đấy)
router.get('/:idClass', checkAuth.checkMemberInClass, function (req, res) {
    let newScoreList = res.locals.scoreList.map(item => {
        let currentItem = item.toObject()
        currentItem.rawAttendance = {
            attendOnTime: attendOnTime(item.attendance),
            attendLate: attendLate(item.attendance),
            noAttendance: noAttendance(item.attendance)
        }
        return currentItem
    });
    res.locals.scoreList = newScoreList;
    return res.status(200).json(sendSuccess(CLASS_DETAIL, res.locals));
});

module.exports = router;