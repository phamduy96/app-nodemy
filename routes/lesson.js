const express = require('express');
const router = express.Router();
const lessonService = require('../services/lesson')
const { sendError, sendSuccess } = require('../utils/index')
const checkAuth = require('../Auth/checkAuth');
const { createVideoLesson }=require("../services/uploadImage");
const redisClient = require("../config/redis");
const videoQueue = require('../queue/media').videoQueue

var {
  CREATE_LESSON_FAILED,
  CREATE_LESSON_SUCCESS,
  INVALID_INPUT,
  GET_LIST_DATA_SUCCESS,
  GET_LIST_DATA_FAILED,
  DELETE_FAILED,
  DELETE_SUCCESS,
  UPDATE_SUCCESS,
  UPDATE_FAILED,
  SERVER_ERROR
} = require('../config/error');

router.get('/', checkAuth.checkTeacher, async function (req, res, next){
  try {
    var lessons = await lessonService.getAllLesson()
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, lessons));
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
})


router.post('/', checkAuth.checkTeacher, async function (req, res, next){
  if(!req.body.title) return res.status(400).json(sendError(INVALID_INPUT))
  try {
    var lesson= await lessonService.createLesson(req.body.title, req.body.description,req.body.quizz)
    return res.status(200).json(sendSuccess(CREATE_LESSON_SUCCESS, lesson))
  } catch (error) {
    return res.status(400).json(sendError(CREATE_LESSON_FAILED))
  }
})

router.delete('/:id', checkAuth.checkTeacher, async function (req, res, next){
  try {
    var lessonDeleted = await lessonService.deleteLesson(req.params.id)
    return res.status(200).json(sendSuccess(DELETE_SUCCESS, lessonDeleted))
  } catch (error) {
    return res.status(400).json(sendError(DELETE_FAILED))
  }
})

router.get('/:id', checkAuth.checkOnwerCourser, async function (req, res, next){
  try {
    var lesson = await lessonService.findLesson(req.params.id)
    var videoUpload = await redisClient.get("job"+req.params.id)
    lesson = lesson.toJSON()
    lesson.videoUpload = videoUpload
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, lesson))
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
})

router.put('/:id', checkAuth.checkTeacher, async function (req, res, next){
  let newLesson = {}
  if(req.body.title) newLesson.title = req.body.title
  if(req.body.description) newLesson.description = req.body.description
  if(req.body.quizz) newLesson.quizz = req.body.quizz

  try {
    var lesson = await lessonService.updateLesson(req.params.id, newLesson)
    return res.status(200).json(sendSuccess(UPDATE_SUCCESS, lesson))
  } catch (error) {
    return res.status(400).json(sendError(UPDATE_FAILED))
  }
})

router.post('/:id/upload-video', checkAuth.checkTeacher, function (req, res, next) {
  createVideoLesson(req, res, next);
}, async function(req, res, next){
  try {
    let videoPath = res.locals.uploadFile.url
    videoQueue.add({idLesson: req.params.id, filePath: videoPath, watermark: null}, {
      removeOnComplete: true
    });
    return res.status(200).json(sendSuccess(UPDATE_SUCCESS, {
      idLesson: req.params.id
    }))
  } catch (error) {
    return res.status(500).json(sendError(SERVER_ERROR))
  }
})

module.exports = router;