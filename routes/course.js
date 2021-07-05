var express = require('express');
var router = express.Router();
const courseService = require('../services/courses');
const { sendError, sendSuccess } = require('../utils/index');
const checkAuth = require('../Auth/checkAuth');
var {
    SERVER_ERROR,
    GET_DATA_SUCCESS,
    CREATE_COURSE_SUCCESS,
    UPDATE_SUCCESS,
    CREATE_VOUCHER_SUCCESS,
    CREATE_SUCCESS
} = require('../config/error');

router.post('/', async function(req, res, next){
    try {
        let newCourse = {
            account: req.body.account,
            module: req.body.module,
            status: 'inactive'
        }
        var data = await courseService.createCourse(newCourse)
        res.json(sendSuccess(CREATE_COURSE_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.get('/:id', async function(req, res, next) {
    try {
        var data = await courseService.findCourseById(req.params.id)
        res.json(sendSuccess(GET_DATA_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.get('/', async function(req, res, next) {
    try {
        var status = req.query.status
        var data = null
        if(status !== 'inactive' && status !== 'active'){
            data = await courseService.getAllCourses()
        }else{
            data = await courseService.getCoursesByCondition({status: status})
        }
         
        res.json(sendSuccess(GET_DATA_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.get('/:idModule/:idAccount', async function(req, res, next) {
    try {
        let module = req.params.idModule
        let account = req.params.idAccount
        let data = await courseService.getCoursesByCondition({module, account})
        res.json(sendSuccess(GET_DATA_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.post('/:id/lesson/:idLesson', async function(req, res, next) {
    try {
        var data = await courseService.addLessonStatus(req.params.id, req.params.idLesson)
        res.json(sendSuccess(CREATE_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.put('/:id/complete-lesson/:idLesson', async function(req, res, next) {
    try {
        var data = await courseService.updateLessonStatus(req.params.id, req.params.idLesson, req.body.status, req.body.complete)
        res.json(sendSuccess(UPDATE_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

module.exports = router;