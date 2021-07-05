var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
const classService = require('../services/class');
const accountService = require('../services/account');
const hash = require('../config/bcrypt');

var storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + req.params.id + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('avatar');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Image Only!');
  }
}

router.post('/upload-avatar/:id', function (req, res, next) {
  upload(req, res, async (err) => {
    if (err) {
      res.json({
        error: true,
        message: err + '',
      });
    } else {
      if (req.file === undefined) {
        res.json({
          error: true,
          message: 'No file selected!',
        });
      } else {
        var imgInfo = {};
        var dataUser = await accountService.checkID(req.params.id);
        if (dataUser) {
          if (dataUser.avatar != req.file.filename && req.file.filename) {
            imgInfo.avatar = req.file.filename;
          }
          accountService
            .editAccount(req.params.id, imgInfo)
            .then(function () {
              res.json({
                error: false,
                message: 'File uploaded!',
                file: `/public/uploads/${req.file.filename}`,
              });
            })
            .catch(function (err) {
              res.json(err + '');
            });
        } else {
          res.json({
            error: true,
            message: 'cap nhap bi loi',
          });
        }
      }
    }
  });
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  accountService.getAll().then(function (data) {
    res.json(data);
  });
});

router.post(
  '/',
  function (req, res, next) {
    accountService
      .getUser(req.body.email)
      .then(function (data) {
        if (data.length > 0) {
          return res.json({
            error: true,
            message: 'email da ton tai',
          });
        }
        next();
      })
      .catch(function (err) {
        res.json(err + '');
      });
  },
  function (req, res, next) {
    accountService
      .createAccount(req.body.email, hash(req.body.password), req.body.name, req.body.role)
      .then(function () {
        res.json({
          error: false,
          message: 'tao tai khoan thanh cong',
        });
      })
      .catch(function (err) {
        res.json({
          error: true,
          message: 'tao tai khoan khong thanh cong ' + err,
        });
      });
  },
);

router.delete('/:id', function (req, res, next) {
  accountService
    .deleteAccount(req.params.id)
    .then(function () {
      res.json({
        error: false,
        message: 'xoa thanh cong',
      });
    })
    .catch(function (err) {
      res.json({
        error: true,
        message: 'xoa khong thanh cong' + err,
      });
    });
});

router.put('/:id', async function (req, res, next) {
  var id = req.params.id;
  var dataUser = await accountService.checkID(id);
  var userInfo = {};
  if (dataUser) {
    if (dataUser.email != req.body.email && req.body.email) {
      userInfo.email = req.body.email;
    }
    //
    if (dataUser.password != req.body.password && req.body.password) {
      userInfo.password = hash(req.body.password);
    }
    if (dataUser.name != req.body.name && req.body.name) {
      userInfo.name = req.body.name;
    }
    accountService
      .editAccount(id, userInfo)
      .then(function (data) {
        res.json('updated');
      })
      .catch(function (err) {
        res.json(err + '');
      });
  } else {
    res.json({
      error: true,
      message: 'cap nhap bi loi',
    });
  }
});

router.post('/class', async function (req, res, next) {
  var user = await accountService.getUser(req.body.email);
  if (user.length < 1) {
    res.json('giang vien khong ton tai');
  } else {
    if (user[0].role === 'teacher') {
      classService.createClass(req.body.nameClass, user[0]._id).then(function () {
        res.json({
          error: false,
          message: 'tao lop thanh cong',
        });
      });
    } else {
      res.json({
        error: true,
        message: 'them giang khong thanh cong',
      });
    }
  }
});

router.get('/teacher-class', function (req, res, next) {
  classService
    .getclass(req.body.nameClass)
    .populate('teacher')
    .exec(function (err, teachers) {
      res.json(teachers[0].teacher.name);
    });
});

router.get('/class', async function (req, res, next) {
  var teacher = await accountService.getName(req.body.name);
  var nameClass = [];
  for (let i = 0; i < teacher.length; i++) {
    if (teacher[i].role === 'teacher') {
      classService
        .getTeacher(teacher[i]._id)
        .populate('teacher')
        .exec(function (err, result) {
          for (let j = 0; j < result.length; j++) {
            nameClass.push(result[j].name);
          }
          res.json(nameClass);
        });
    }
  }
});

module.exports = router;
