const express = require('express');
const router = express.Router();
const scoreService = require('../services/score')
const accountService = require('../services/account')
const { sendError, sendSuccess } = require('../utils/index')
const {checkTeacherInClass, checkActive, checkAuth, checkStatusBlockUser, checkMemberInClass} = require('../Auth/checkAuth');
const { attendOnTime, noAttendance, attendLate } = require("../utils/score-user/attendance.js")
const _ = require('lodash')
var {
    UPDATE_FAILED,
    NONE_OF_EMAIL_VALID,
    ADD_USER_SUCCESS,
    NOT_A_STUDENT_OF_CLASS,
    ATTENDANCE_DONE,
    DELETE_STUDENT_FAILED,
    DELETE_STUDENT_SUCCESS,
    UPDATE_SUCCESS,
    POINT_DONE,
    GET_LIST_USER,
    GET_SCORE_USER,
    CLASS_NOT_FOUND,
    USER_NOT_FOUND
} = require('../config/error');
const jwt = require("jsonwebtoken");
const AccountModel = require("../models/accounts")
router.get("/user", async function(req, res){
    try {
        let token = req.query.token;
        var idUser = null;
        if(token){
            let decode = await jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
               return res.status(500).json(sendError(INVALID_TOKEN));
            }
            let userLocal = await AccountModel.findById(decode._id);
            if(!userLocal) return res.status(500).json(sendError(USER_NOT_FOUND));
            idUser = userLocal._id;
        }
        if(req.query.idUser){
            idUser = req.query.idUser;
        }
        var scores = await scoreService.getAllScoreOfUser(idUser);
        if(scores.length){
            let newScores = scores.map(item=>{
                let currentItem =  item.toObject()
                currentItem.rawAttendance = {
                    attendOnTime: attendOnTime(item.attendance),
                    attendLate: attendLate(item.attendance),
                    noAttendance: noAttendance(item.attendance)
                }
                return currentItem
            })
            return res.status(200).json(sendSuccess(GET_SCORE_USER, newScores));
        }else{
            return res.status(400).json(sendError(USER_NOT_FOUND));
        }
    } catch (error) {
        return res.status(400).json(sendError(USER_NOT_FOUND));
    }
})


router.use(checkAuth);
router.use(checkActive);
router.use(checkStatusBlockUser);


router.post('/:id', checkTeacherInClass, async function (req, res, next) {
    var emails = req.body.emails
    let invalidEmail = []
    let validEmail = []
    let listValidStudent = []
    try {
        if (req.user.role == 'admin' || req.user.role == 'teacher') {
           
            let processGetStudentInClass = scoreService.getAllStudentsInClass(req.params.id).populate('idAccount').exec()
            let processGetUserByEmail = accountService.getStudentsByEmails(emails); // get user by email
            
            // check correct student email or not
            var listValidStudentsEmail = listValidStudent = await processGetUserByEmail;
            listValidStudentsEmail = listValidStudentsEmail.map(student=>{
                return student.email
            })
           
            invalidEmail = invalidEmail.concat(_.difference(emails, listValidStudentsEmail))
            validEmail = validEmail.concat(_.difference(emails, invalidEmail))
           

             // check student not in class
            var studentInClass = await processGetStudentInClass;
            studentInClass = studentInClass.map(score=>{
                return score.idAccount.email
            })

            validEmail = _.difference(validEmail, studentInClass)
            invalidEmail = _.difference(emails, validEmail)
          
            if(validEmail.length <= 0){
                return res.status(400).json(sendError(NONE_OF_EMAIL_VALID))
            }

            listValidStudent = listValidStudent.filter(student=>{
                return validEmail.includes(student.email)
            })
            let listValidStudentId = _.map(listValidStudent, '_id')
            // add validEmail student to class
            await scoreService.addUsersToClass(req.params.id, listValidStudentId)
            return res.status(200).json(sendSuccess(ADD_USER_SUCCESS, {
                validEmail,
                invalidEmail
            }))

        }
    } catch (error) {
        res.status(400).json(sendError(UPDATE_FAILED))
    }
})

router.put('/point/:id', checkTeacherInClass, async function (req, res, next) {
    try {
        var result = await scoreService.updatePointOfStudent(req.body, req.params.id)
        if(result.nModified > 0){
            return res.status(200).json(sendSuccess(POINT_DONE))
        }else{
            return res.status(400).json(sendError(NOT_A_STUDENT_OF_CLASS))
        }
    } catch (error) {
        return res.status(400).json(sendError(UPDATE_FAILED))
    }
})

router.put('/:id', checkTeacherInClass, async function (req, res, next) {
    var infoAttend = {
        lesson: req.body.lesson, 
        statusAttend: req.body.statusAttend,
        note: req.body.note,
        idLesson: req.body.idLesson
    }
    try {
        var result = await scoreService.attendStudentsWithLesson(req.body.idStudents, req.params.id, infoAttend)
        if(result.nModified > 0){
            return res.status(200).json(sendSuccess(ATTENDANCE_DONE))
        }else{
            return res.status(400).json(sendError(NOT_A_STUDENT_OF_CLASS))
        }
    } catch (error) {
        return res.status(400).json(sendError(UPDATE_FAILED))
    }
})

router.delete('/:id', checkTeacherInClass, async function (req, res, next) {
    try {
        var result = await scoreService.updateStatusStudentsInClass(req.body.idStudents, req.params.id, 0)
        if(result.nModified > 0){
            return res.status(200).json(sendSuccess(DELETE_STUDENT_SUCCESS))
        }else{
            return res.status(400).json(sendError(NOT_A_STUDENT_OF_CLASS))
        }
    } catch (error) {
        return res.status(400).json(sendError(DELETE_STUDENT_FAILED))
    }
})

router.put('/:id/enable', checkTeacherInClass, async function (req, res, next) {
    try {
        var result = await scoreService.updateStatusStudentsInClass(req.body.idStudents, req.params.id, 1)
        if(result.nModified > 0){
            return res.status(200).json(sendSuccess(UPDATE_SUCCESS))
        }else{
            return res.status(400).json(sendError(NOT_A_STUDENT_OF_CLASS))
        }
    } catch (error) {
        return res.status(400).json(sendError(UPDATE_FAILED))
    }
})
router.get('/score-user/:idClass/:idStudent', checkMemberInClass, async function (req, res, next) {
    try {
        var result = await scoreService.getAllScoreOfClass(req.params.idClass,req.params.idStudent);
        if(result.length){
            return res.status(200).json(sendSuccess(GET_SCORE_USER));
        }else{
            return res.status(400).json(sendError(NOT_A_STUDENT_OF_CLASS));
        }
    } catch (error) {
        return res.status(400).json(sendError(CLASS_NOT_FOUND));
    }
})

router.get('/:idClass', checkMemberInClass, async function (req, res, next) {

    try {
        var result = await scoreService.getAllUserOfClass(req.params.idClass);
        
        if(result.length){
          
            return res.status(200).json(sendSuccess(GET_LIST_USER, result));
        }
    } catch (error) {
        return res.status(400).json(sendError(CLASS_NOT_FOUND));
    }
})

router.delete('/delete/:idClass', async function(req, res, next) {
    try {
        let result = await scoreService.deleteStudentFromClass(req.params.idClass, req.body.idStudent)
        res.status(200).json(sendSuccess(DELETE_STUDENT_SUCCESS, result))
    } catch (error) {
        res.status(500).json(sendError(DELETE_CLASS_FAILED))
    }
})
module.exports = router;
