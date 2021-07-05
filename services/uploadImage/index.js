const uploadAvatar = require("./uploadAvatar");
const uploadModule = require("./uploadModule");
const uploadQuestionSupport = require("./uploadQuestionSupport");
const uploadLesson = require("./uploadLessonMedia");
const accountService = require("../../services/account");
const path = require('path')
const { sendError, sendSuccess } = require("../../utils");

var {
  SERVER_ERROR,
  UPLOAD_FAILED,
  NO_FILE_SELECT,
  UPDATE_AVATAR_FAILED,
} = require("../../config/error");

const createAvatar = (req, res) => {
  return uploadAvatar(req, res, async (err) => {
    if (err) res.status(500).json(sendError(UPLOAD_FAILED));
    if (req.file === undefined) res.status(400).json(sendError(NO_FILE_SELECT));
    var imgInfo = {};
    var dataUser = await accountService.checkID(req.params.id);

    if (dataUser) {
      try {
        imgInfo["avatar"] = `${
          process.env.NODE_ENV !== "production"
            ? process.env.HOST_DOMAIN_DEV
            : process.env.DOMAIN
        }/public/uploads/avatar/${req.file.filename}`;
        await accountService.editAccount(req.params.id, imgInfo);
        return res.json({
          error: false,
          name: req.file.filename,
          message: "File uploaded!",
          status: "done",
          url: `${
            process.env.NODE_ENV !== "production"
              ? process.env.HOST_DOMAIN_DEV
              : process.env.HOST_DOMAIN
          }/public/uploads/avatar/${req.file.filename}`,
          thumbUrl: `${
            process.env.NODE_ENV !== "production"
              ? process.env.HOST_DOMAIN_DEV
              : process.env.HOST_DOMAIN
          }/public/uploads/avatar/${req.file.filename}`,
        });
      } catch (err) {
        res.status(500).json(sendError(UPDATE_AVATAR_FAILED));
      }
    } else {
      return res.status(400).json(sendError(SERVER_ERROR));
    }
  });
};

const createImageModule=(req,res)=>{
   return uploadModule(req,res,async (err)=>{
    if (err) res.status(500).json(sendError(UPLOAD_FAILED));
    if (req.file === undefined) res.status(400).json(sendError(NO_FILE_SELECT));
    return res.json({
        error: false,
        name: req.file.filename,
        message: "File uploaded!",
        status: "done",
        url: `${
            process.env.NODE_ENV !== "production"
              ? process.env.HOST_DOMAIN_DEV
              : process.env.HOST_DOMAIN
          }/public/uploads/modules/${req.file.filename}`,
      });
   })
}

const createImageQuestionSupport = (req,res) => {
  return uploadQuestionSupport(req, res, async (err)=>{
   if (err){
    return res.status(500).json(sendError(UPLOAD_FAILED));
   } 
   if (req.file === undefined) return res.status(400).json(sendError(NO_FILE_SELECT));
   return res.json({
       error: false,
       name: req.file.filename,
       message: "File uploaded!",
       status: "done",
       url: `${
           process.env.NODE_ENV !== "production"
             ? process.env.HOST_DOMAIN_DEV
             : process.env.HOST_DOMAIN
         }/public/uploads/questionSupport/${req.file.filename}`,
     });
  })
}

const createVideoLesson =(req, res, next)=>{
  return uploadLesson(req, res, async (err)=>{
    if (err) res.status(500).json(sendError(UPLOAD_FAILED));
    if (req.file === undefined) res.status(400).json(sendError(NO_FILE_SELECT));
  
    res.locals = {}
    res.locals.uploadFile = {
      error: false,
      name: req.file.filename,
      message: "File uploaded!",
      status: "done",
      url: path.join(__dirname, '../../media', req.file.filename)
    }

    next()
  })
}

module.exports = {
  createAvatar,
  createImageModule,
  createVideoLesson,
  createImageQuestionSupport
};
