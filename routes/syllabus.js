const express = require("express");
const router = express.Router();
const syllabusService = require("../services/syllabus");
const { sendError, sendSuccess } = require("../utils/index");
const checkAuth = require("../Auth/checkAuth");
var {
  CREATE_SYLLABUS_SUCCESS,
  CREATE_SYLLABUS_FAILED,
  INVALID_INPUT,
  GET_LIST_DATA_SUCCESS,
  GET_LIST_DATA_FAILED,
  DELETE_FAILED,
  DELETE_SUCCESS,
  UPDATE_SUCCESS,
  UPDATE_FAILED,
} = require("../config/error");

router.get('/', checkAuth.checkTeacher, async (req, res, next)=>{
    try {
        var syllabus = await syllabusService.getAllSyllabus()
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, syllabus));
    } catch (error) {
        return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
    }
})

router.post("/", checkAuth.checkTeacher, async function (req, res, next) {
    if (!req.body.title) return res.status(400).json(sendError(INVALID_INPUT));
    if (!req.body.modules || req.body.modules.length <= 0)
      return res.status(400).json(sendError(INVALID_INPUT));
  
    try {
      var syllabus = await syllabusService.createSyllabus(
        req.body.title,
        req.body.description,
        req.body.modules
      );
      return res.status(200).json(sendSuccess(CREATE_SYLLABUS_SUCCESS, syllabus));
    } catch (error) {
      return res.status(400).json(sendError(CREATE_SYLLABUS_FAILED));
    }
  });
  
  router.delete(
    "/:id",
    checkAuth.checkTeacher,
    async function (req, res, next) {
      try {
        var syllabusDeleted = await syllabusService.deleteSyllabus(req.params.id);
        return res.status(200).json(sendSuccess(DELETE_SUCCESS, syllabusDeleted));
      } catch (error) {
        return res.status(400).json(sendError(DELETE_FAILED));
      }
    }
  );
  
  router.get("/:id", async function (req, res, next) {
    try {
      var syllabus = await syllabusService.findSyllabus(req.params.id).populate('modules').populate({path:"modules",  populate: { path: 'lessons' }});
      return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, syllabus));
    } catch (error) {
      return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
    }
  });
  
  router.put("/:id", checkAuth.checkTeacher, async function (req, res, next) {
    let newSyllabus = {};
    if (req.body.title) newSyllabus.title = req.body.title;
    if (req.body.description) newSyllabus.description = req.body.description;
    if (req.body.modules && req.body.modules.length > 0)
      newSyllabus.modules = req.body.modules;

    try {
      var syllabus = await syllabusService.updateSyllabus(req.params.id, newSyllabus);
      return res.status(200).json(sendSuccess(UPDATE_SUCCESS, syllabus));
    } catch (error) {
      return res.status(400).json(sendError(UPDATE_FAILED));
    }
  });

module.exports= router