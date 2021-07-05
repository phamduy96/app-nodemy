var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
const accountService = require('../services/account');
const emailService = require('../services/email')
const hash = require('../config/bcrypt')
const { sendError, sendSuccess } = require('../utils/index')
const {checkAuth, checkAdmin, checkStatusBlockUser, checkUser } = require('../Auth/checkAuth')
var jwt = require('jsonwebtoken')
const {checkDir}=require("../services/uploadImage/checkDir")
const {createAvatar}=require("../services/uploadImage");

var {
    SERVER_ERROR,
    ACCOUNT_NOT_FOUND,
    UPDATE_ACCOUNT_SUCCESS,
    UPDATE_CLASS_SUCCESS,
    DELETE_CLASS_SUCCESS,
    UPDATE_AVATAR_FAILED,
    GET_LIST_USER,
    EMAIL_ALREADY_EXISTS,
    CREATE_ACCOUNT_SUCCESS,
    SIGNUP_FAILED,
    DELETE_CLASS_FAILED,
    CHECK_EMAIL,
    GET_LIST_TEACHER,
    USER_NOT_FOUND,
    UPDATE_SUCCESS
} = require('../config/error');

router.post('/upload-avatar/:id', checkAuth, checkStatusBlockUser, function (req, res, next) {
    checkDir();
    createAvatar(req,res);
})

router.put('/changePassword', function(req, res, next) {
    try {
        var idDecode = jwt.verify(req.query.tokenEmail, process.env.JWT_SECRET)
        accountService.updatePassword(idDecode, hash(req.body.newPassword)).then(function() {
            res.status(200).json(sendSuccess(UPDATE_CLASS_SUCCESS))
        }).catch(function(err) {
            res.status(400).json(sendError(SERVER_ERROR))
        })
        res.clearCookie("tokenEmail")
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})

router.post('/forgot-password', function(req, res, next) {
    accountService.getUser(req.body.email).then(function(data) {
        if (data < 1) {
            res.status(400).json(sendError(ACCOUNT_NOT_FOUND))
        } else {
            jwt.sign(data[0]._id.toString(), process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    return res.status(500).json(sendError(SERVER_ERROR))
                }
                var link = `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/users/forgot-password/${token}`;
                emailService.sendForgotPassMail(req.body.email, link, data[0].name).then(() => {
                    res.status(200).json(sendSuccess(CHECK_EMAIL, token));
                }).catch(err =>  {
                    return res.status(500).json(sendError(SERVER_ERROR))
                })
            })
        }
    }).catch(err=>{
        return res.status(500).json(sendError(SERVER_ERROR))
    })
})

router.get('/forgot-password/:tokenEmail', function(req, res, next) {
    try {
        var tokenEmailDecode = jwt.verify(req.params.tokenEmail, process.env.JWT_SECRET)
        if (tokenEmailDecode) {
            res.redirect(`${process.env.NODE_ENV !== 'production' ? process.env.FRONTEND_URI_DEV : process.env.FRONTEND_URI}` + "/success-verify/" + req.params.tokenEmail);
        }
    } catch (error) {
        res.redirect(`${process.env.NODE_ENV !== 'production' ? process.env.FRONTEND_URI_DEV : process.env.FRONTEND_URI}` + "/fail-verify");
    }
})


router.use(checkAuth);
router.use(checkStatusBlockUser)
router.get('/profile', (req, res, next)=>{
  res.status(200).json(sendSuccess(GET_LIST_USER, req.user));
});

router.put('/feedback', async function(req, res, next){
    try {
        let data = await accountService.addFeedback(req.body.idTeacher, req.body.vote)
        res.status(200).json(sendSuccess(UPDATE_SUCCESS, data))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
})
router.put("/updateDaysOff", async (req, res)=>{
    try {
        console.log(req.body.idStaff, req.body.abreak)
        let data = await accountService.updateDaysOff(req.body.idStaff, req.body.daysOff, req.body.abreak)
        
        if(data.nModified >= 1){
            return res.status(200).json({
                status: 200,
                message: "lấy dữ liệu thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
            message: "sai idStaff"
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})
router.put('/:id', async function(req, res, next) {
    var id = req.params.id
    var dataUser = await accountService.checkID(id);
    var userInfo = {}
    if (dataUser) {
        if (dataUser.password != req.body.password && req.body.password) {
            userInfo.password = hash(req.body.password)
        }
        if (dataUser.name != req.body.name && req.body.name) {
            userInfo.name = req.body.name;
        }
        if (dataUser.phone != req.body.phone && req.body.phone) {
            userInfo.phone = req.body.phone;
        }
        if (dataUser.linkFB != req.body.linkFB && req.body.linkFB) {
            userInfo.linkFB = req.body.linkFB;
        }
        accountService.editAccount(id, userInfo).then(function(data) {
            res.status(200).json(sendSuccess(UPDATE_ACCOUNT_SUCCESS, data))
        }).catch(function(err) {
            res.status(400).json(sendError(UPDATE_AVATAR_FAILED))
        })
    } else {
        res.status(500).json(sendError(SERVER_ERROR))
    }

});

router.get('/students', function(req, res, next) {
    try {
       accountService.getAllStudent()
       .then(data=>{
        data = data.map(item=>{
            item.password = undefined
            return item
        })
        res.status(200).json(sendSuccess(GET_LIST_USER, data));
       })
    } catch (error) {
        res.status(500).json(SERVER_ERROR)
    }
});


router.get("/teachers", async function(req, res){
    try {
        var listTeacher = await accountService.getAllTeacher()
        listTeacher = listTeacher.map(item=>{
            item.password = undefined
            return item
        });
        res.status(200).json(sendSuccess(GET_LIST_TEACHER, listTeacher))
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR))
    }
});

router.use(checkAdmin);
/* GET users listing.(admin) */
router.get('/', async function(req, res, next) {
    try {
        let userOfPageProccess = accountService.getUserOfPage(req.query);
        let getAllUserProccess = accountService.getAll().count().exec();
        let totalUser = await getAllUserProccess;
        let userOfPage = await userOfPageProccess;
        res.status(200).json(sendSuccess(GET_LIST_USER, { userOfPage, totalUser: totalUser - 1 }));
    } catch (error) {
        res.status(500).json(SERVER_ERROR)
    }

});

//Create account
router.post('/', function(req, res, next) {
    accountService.getUser(req.body.email).then(function(data) {
        if (data.length > 0) {
            return res.status(400).json(sendError(EMAIL_ALREADY_EXISTS));
        }
        next()
    }).catch(function(err) {
        res.status(500).json(sendError(SERVER_ERROR))
    })
}, function(req, res, next) {
    accountService.createAccount(req.body.email, hash(req.body.password), req.body.name, req.body.role).then(function(acc) {
        return res.json(res.status(200).json(sendSuccess(CREATE_ACCOUNT_SUCCESS, acc)))
    }).catch(function(err) {
        return res.json(json.status(400).json(sendError(SIGNUP_FAILED)))
    })
});

router.put('/change-status/:id', async function(req, res, next) {

    try {
        let data = await accountService.updateStatus(req.params.id, req.body.status);
        if(data.nModified>=1){
            res.status(200).json(sendSuccess(UPDATE_ACCOUNT_SUCCESS));
        }else{
            res.status(400).json(sendSuccess(USER_NOT_FOUND))
        }
    } catch (error) {
        res.status(500).json(sendError(SERVER_ERROR));
    }
});
router.put('/change-role/:id', async function(req, res, next) {

    try {
        if(req.body.role === "admin"){
            return res.status(403).json(sendSuccess({
                status: 403,
                message: "Bạn không có quyền sửa đổi quyền này"
            }))
        }
        let data = await accountService.updateRole(req.params.id, req.body.role);
        if(data.nModified>=1){
            return res.status(200).json(sendSuccess(UPDATE_ACCOUNT_SUCCESS));
        }else{
            return res.status(400).json(sendSuccess(USER_NOT_FOUND))
        }
    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
});
router.delete('/:id', function(req, res, next) {
    accountService.deleteAccount(req.params.id).then(function(data) {
        return res.status(200).json(sendSuccess(DELETE_CLASS_SUCCESS))
    }).catch(function(err) {
        return res.status(400).json(sendError(DELETE_CLASS_FAILED))
    })
});
router.get("/staff", async (req, res)=>{
    try {
        let data = await accountService.getListStaff()
        return res.status(200).json({
            status: 200,
            message: "lấy dữ liệu thành công",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})
router.get("/staff/:id", async (req, res)=>{
    try {
        let id = req.params.id;
        let data = await accountService.getDetailStaff(id)
        return res.status(200).json({
            status: 200,
            message: "lấy dữ liệu thành công",
            data: data
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})

module.exports = router;
