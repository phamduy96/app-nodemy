const express = require('express');
const router = express.Router();
const cvService = require('../services/cv')
const accountService = require('../services/account')
const AccountModel = require('../models/accounts');
const { sendError, sendSuccess } = require('../utils/index')
const multer = require('multer');
var path = require('path');
const { checkAdmin } = require('../Auth/checkAuth')
const jwt = require('jsonwebtoken')
const { checkActive, checkAuth, checkStatusBlockUser} = require('../Auth/checkAuth');
let {
  CREATE_LESSON_FAILED,
  CREATE_LESSON_SUCCESS,
  GET_LIST_DATA_SUCCESS,
  GET_LIST_DATA_FAILED,
  DELETE_FAILED,
  DELETE_SUCCESS,
  UPDATE_SUCCESS,
  UPDATE_FAILED,
  UPLOAD_FAILED
} = require('../config/error');


router.get('/verify/:token', async function (req, res){
  const token = req.params.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const cv = await cvService.cvDetail(decoded.cv);
  if(cv) {
    res.status(200).json({ cvUrl: `${ process.env.NODE_ENV == 'production' ? process.env.FRONTEND_URI : process.env.FRONTEND_URI_DEV}/cv/${cv._id}?token=${token}` })
  } else {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
});

router.get('/public/:id', async (req, res) => {
  const data = {
    cv: req.params.id,
    permission: 'guest'
  }
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 * 1000 });
  res.json({
    permissionCVToken: token
  })
});


router.use(checkAuth);
router.use(checkActive);
router.use(checkStatusBlockUser);

let storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + req.params.id + path.extname(file.originalname))
  }
})

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      cb('Error: Image Only!')
  }
}

let upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
  }
}).single('avatarCV')

// admin get all cv (all user)
router.get('/', checkAdmin, async function (req, res, next){
  try {
    const allCV = await cvService.getAllCV();

    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, allCV));
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
});

// get all cv of user (only user's cv)
router.get('/account/:idAcc', async function (req, res, next){
  const idAcc = req.params.idAcc;
  try {
    const account = await accountService.findAndPopulate(idAcc);
    const allCV = account.cvs;

    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, allCV));
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
});

router.get('/:id', async function (req, res, next){
  try {
    let cv = await cvService.cvDetail(req.params.id)

    if (req.query.token) {
      const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
      if(decoded.permission === 'guest') {
        let newCV = Object.assign({}, cv.toObject());
        newCV.email = undefined;
        newCV.dob = undefined;
        newCV.phone = undefined;
        newCV.address = undefined;
        newCV.github = undefined;
        newCV.website = undefined;
        newCV.facebook = undefined;
        newCV.guest = true;
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, newCV))
      } 
      return;
    }
   
    if (cv.account.toString() !== req.user._id.toString()) {
      let newCV = Object.assign({}, cv.toObject());
        newCV.email = undefined;
        newCV.dob = undefined;
        newCV.phone = undefined;
        newCV.address = undefined;
        newCV.github = undefined;
        newCV.website = undefined;
        newCV.facebook = undefined;
        newCV.guest = true;
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, newCV))
    }

    return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, cv))
  } catch (error) {
    return res.status(400).json(sendError(GET_LIST_DATA_FAILED))
  }
})




router.post('/', async function (req, res, next){
  try {
    const { name, email, experience, education, skill, language, acchievement, project, account } = req.body;
    const newCV = await cvService.createCV(name, email, account);
    let cv = await cvService.cvDetail(newCV._id);

    cv.experience = experience;
    cv.education = education;
    cv.skill = skill;
    cv.language = language;
    cv.acchievement = acchievement;
    cv.project = project;
    cv.save();

    return res.status(200).json(sendSuccess(CREATE_LESSON_SUCCESS, cv))
  } catch (error) {
    return res.status(400).json(sendError(CREATE_LESSON_FAILED))
  }
})

router.put('/:id', async function (req, res, next){
  try {
    let cv = await cvService.cvDetail(req.params.id)
    if (cv.account.toString() !== req.user._id.toString()) {
      return res.status(400).json(sendError(UPDATE_FAILED))
    }
    let newData = {...req.body};
    
    let cvUpdate = await cvService.updateCV(req.params.id, newData)
    return res.status(200).json(sendSuccess(UPDATE_SUCCESS, cvUpdate))
  } catch (error) {
    return res.status(400).json(sendError(UPDATE_FAILED))
  }
})

router.delete('/:id', async function (req, res, next){
  try {
    let cv = await cvService.cvDetail(req.params.id)
    if (cv.account.toString() !== req.user._id.toString()) {
      return res.status(400).json(sendError(UPDATE_FAILED))
    }
    let cvDeleted = await cvService.deleteCV(req.params.id)
    return res.status(200).json(sendSuccess(DELETE_SUCCESS, cvDeleted))
  } catch (error) {
    return res.status(400).json(sendError(DELETE_FAILED))
  }
})


router.post('/upload-avatar/:id', async function (req, res, next) {
  let cv = await cvService.cvDetail(req.params.id)
  if (cv.account.toString() !== req.user._id.toString()) {
    return res.status(400).json(sendError(UPDATE_FAILED))
  }
  upload(req, res, async (err) => {
    if (err) {
      res.status(500).json(sendError(UPLOAD_FAILED))
    } else {  
      if (req.file === undefined) {
        res.status(400).json(sendError(NO_FILE_SELECT))
      } else {
        var imgInfo = {}
        let cvDetail = await cvService.cvDetail(req.params.id);

        if (cvDetail) {
          imgInfo['avatar'] = `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/public/uploads/${req.file.filename}`;

          cvService.updateCV(req.params.id, imgInfo).then(function (response) {
            // res.json(response)
            res.json({
              error: false,
              name: req.file.filename,
              message: 'File uploaded!',
              status: 'done',
              url: `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.HOST_DOMAIN}/public/uploads/${req.file.filename}`,
              thumbUrl: `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.HOST_DOMAIN}/public/uploads/${req.file.filename}`
            })
          }).catch(function (err) {
            res.status(500).json(sendError(UPDATE_AVATAR_FAILED))
          })
        } else {
          res.status(400).json(sendError(SERVER_ERROR))
        }
      }
    }
  })
})

module.exports = router;