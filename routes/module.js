const express = require("express");
const router = express.Router();
const moduleService = require("../services/module");
const { sendError, sendSuccess } = require("../utils/index");
const checkAuth = require("../Auth/checkAuth");
const {checkDir,reNameImage}=require("../services/uploadImage/checkDir")
const {createImageModule}=require("../services/uploadImage")

var {
  CREATE_MODULE_SUCCESS,
  CREATE_MODULE_FAILED,
  INVALID_INPUT,
  GET_LIST_DATA_SUCCESS,
  GET_LIST_DATA_FAILED,
  DELETE_FAILED,
  DELETE_SUCCESS,
  UPDATE_SUCCESS,
  UPDATE_FAILED,
} = require("../config/error");

// not require login
router.get('/courses', async function(req, res, next){
  try {
    var modules = await moduleService.getAllSellingModule();
   
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, modules));
  } catch (error) {
   
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
})

router.get('/courses/joined', checkAuth.checkAuth, checkAuth.checkActive, checkAuth.checkStatusBlockUser, async function(req, res, next){
  try {
    var modules = await moduleService.getOwnModuleById(req.user._id);
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, modules));
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
})
//hiển thị toàn bộ thông tin module khi người dùng checkout
router.get("/get-module-checkout/:listIdModule",async function(req, res){
  try {
    let listModule = await moduleService.getModuleCheckOut(req.params.listIdModule.split(","));
    res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, listModule))
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
})
router.get('/free', async function(req, res, next){
  try {
    var modules = await moduleService.getAllFreeModule();
   
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, modules));
  } catch (error) {
   
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
})

router.get("/:id", async function (req, res, next) {
  try {
    var module = await moduleService.findModule(req.params.id).populate('lessons')
    .populate('votes.student', 'name avatar');
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, module));
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
});

//must login
router.use(checkAuth.checkAuth);
router.use(checkAuth.checkActive);
router.use(checkAuth.checkStatusBlockUser);

router.get("/", async function (req, res, next) {
  try {
    var modules = await moduleService.getAllModule();
   
    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, modules));
  } catch (error) {
   
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
  }
});

router.post("/", checkAuth.checkTeacher, async function (req, res, next) {
  if (!req.body.title) return res.status(400).json(sendError(INVALID_INPUT));
  if (!req.body.lessons || req.body.lessons.length <= 0)
    return res.status(400).json(sendError(INVALID_INPUT));
  if (!req.body.points && req.body.points.length <= 0)
    return res.status(400).json(sendError(INVALID_INPUT));

  try {
    var module = await moduleService.createModule(
      req.body.title,
      req.body.description,
      req.body.lessons,
      req.body.points
    );
    let urlImage=reNameImage(module._id);
    if (urlImage) {
      await moduleService.updateModule(module._id,{image:urlImage});
    } 
   
    return res.status(200).json(sendSuccess(CREATE_MODULE_SUCCESS, module));
  } catch (error) {
    return res.status(400).json(sendError(CREATE_MODULE_FAILED));
  }
});

router.post("/upload-module",checkAuth.checkTeacher, (req, res, next) => {
  checkDir();
  createImageModule(req,res);
});

router.delete(
  "/:id",
    checkAuth.checkTeacher,
  async function (req, res, next) {
    try {
      var moduleDeleted = await moduleService.deleteModule(req.params.id);
      return res.status(200).json(sendSuccess(DELETE_SUCCESS, moduleDeleted));
    } catch (error) {
      return res.status(400).json(sendError(DELETE_FAILED));
    }
  }
);

router.put("/:id", checkAuth.checkTeacher, async function (req, res, next) {
  let newdModule = {};
  if (req.body.title) newdModule.title = req.body.title;
  if (req.body.description) newdModule.description = req.body.description;
  if (req.body.originalPrice) newdModule.originalPrice = req.body.originalPrice;
  if (req.body.salePrice) newdModule.salePrice = req.body.salePrice;
  if (req.body.ticket) newdModule.ticket = req.body.ticket;
  if (req.body.urlIntro) newdModule.urlIntro = req.body.urlIntro;
  if (req.body.tag) newdModule.tag = req.body.tag;
  if (req.body.author) newdModule.author = req.body.author;
  if (req.body.lessons && req.body.lessons.length > 0)
    newdModule.lessons = req.body.lessons;
  if (req.body.benifit && req.body.benifit.length > 0)
    newdModule.benifit = req.body.benifit;
  if (req.body.points && req.body.points.length > 0)
    newdModule.points = req.body.points;

  try {
    let urlImage=reNameImage(req.params.id);
    if (urlImage) {
      newdModule.image=urlImage;
    } 
    var module = await moduleService.updateModule(req.params.id, newdModule);
    return res.status(200).json(sendSuccess(UPDATE_SUCCESS, module));
  } catch (error) {
    return res.status(400).json(sendError(UPDATE_FAILED));
  }
});

router.put("/:id/votes", async function (req, res, next) {
  let newdModule = {};
  if (req.body.student) newdModule.student = req.body.student;
  if (req.body.rate) newdModule.rate = req.body.rate;
  if (req.body.comment) newdModule.comment = req.body.comment;

  try {
    var module = await moduleService.updateVotes(req.params.id, newdModule);
    return res.status(200).json(sendSuccess(UPDATE_SUCCESS, module));
  } catch (error) {
    return res.status(500).json(sendError(UPDATE_FAILED));
  }
});

module.exports = router;
