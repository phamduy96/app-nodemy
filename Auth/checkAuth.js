const jwt = require('jsonwebtoken');
const AccountModel = require('../models/accounts');
const CourseModel = require('../models/courses');
const clientRedis = require('../config/redis');
const util = require('util');
clientRedis.get = util.promisify(clientRedis.get);
const { sendError } = require('../utils/index');
var {
    SERVER_ERROR,
    NOT_PERMISSON,
    CLASS_NOT_FOUND,
    INVALID_TOKEN,
    LOGIN,
    NEED_ACTIVE,
    BLOCK_USER
} = require('../config/error');

var scoreServices = require('../services/score');
var classServices = require('../services/class');
const courses = require('../services/courses');

var checkMemberInClass = async(req, res, next) => {
    var check = false;

    try {
        var getClassProcess = (await classServices.checkID(req.params.idClass)
        .populate('teacher', ['_id', 'name', 'avatar'])
        .populate({
            path: "idSyllabus.modules",
            populate: "lessons",
        }).exec())

        var getScoreListProcess = scoreServices
            .getAllStudentsInClass(req.params.idClass)
            .populate('idAccount', ['_id', 'name', 'avatar', "email", "phone"])
            .populate('attendance.idlesson').exec();
        var classInfo = await getClassProcess;
        var scoreList = await getScoreListProcess;
        var scoreActiveList = scoreList.filter(score=>{
            return score.status === 1
        })
    } catch (err) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }


    if (classInfo) {
        res.locals = {
            scoreList: scoreActiveList,
            classInfo: classInfo,
        };

        for (index in scoreList) {
            let studentScore = scoreList[index]
            var idUser = req.user._id.toString().trim();
            var idStudent = studentScore.idAccount._id.toString().trim();
            if (studentScore.status === 1 && idUser == idStudent) {
                check = true;
            }
        }

        if (classInfo.teacher._id.toString() == req.user._id.toString() || req.user.role === "admin" ) {
            res.locals.scoreList = scoreList
            check = true;
        }
    
        if (check) {
            next();
        } else {
            return res.status(400).json(sendError(NOT_PERMISSON));
        }
    } else {
        return res.status(500).json(sendError(CLASS_NOT_FOUND));
    }
};

async function checkAuth(req, res, next) {
    var token = null;
    if (req.cookies && req.cookies['token']) {
        token = req.cookies['token'];
    }

    if (req.body.token) {
        token = req.body.token;
    }

    var authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
        token = authHeader.substring(7, authHeader.length);
    }
    // check backlist token
    clientRedis.lrange('token', 0, -1, async(err, result) => {
        if (result.includes(token)) {
            return res.status(500).json(sendError(INVALID_TOKEN));
        }

        try {
            // decode token
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                res.status(500).json(sendError(INVALID_TOKEN));
            }

            let userLocal = await AccountModel.findById(decode._id);
            userLocal.password = undefined;
            req.user = userLocal;
            next();
        
        } catch (error) {
            res.status(500).json(sendError(LOGIN));
        }
    });
}

let checkActive = (req, res, next) => {
    if(req.user.status == 'active') {
        next();
    } else {
        return res.status(400).json(sendError(NEED_ACTIVE));
    }
}

let checkTeacher = (req, res, next) => {
    if (req.user.role === 'teacher' || req.user.role == 'admin') {
        next();
    } else {
        return res.status(400).json(sendError(NOT_PERMISSON));
    }
};

let checkTeacherInClass = async(req, res, next) => {
    try{
        var classID = await classServices.checkID(req.params.id);
        if(!classID){
            return res.status(400).json(sendError(CLASS_NOT_FOUND));
        }

        if (
            (req.user.role === 'teacher' && req.user._id.toString() == classID.teacher.toString()) ||
            req.user.role == 'admin'
        ) {
            next();
        } else {
            return res.status(400).json(sendError(NOT_PERMISSON));
        }
    }
    catch(err){
        return res.status(500).json(sendError(SERVER_ERROR));
    }
};


let checkAdmin = (req, res, next) => {
    if (req.user.role == 'admin') {
        next();
    } else {
        return res.status(400).json(sendError(NOT_PERMISSON))
    }
}

let checkSaler = (req, res, next) => {
    if (req.user.role === 'saler' || req.user.role == 'admin') {
        next();
    } else {
        return res.status(400).json(sendError(NOT_PERMISSON))
    }
}

let checkStatusBlockUser = (req, res, next) => {
    if(req.user.status !== "block"){
        next();
    }else{
        return res.status(400).json(sendError(BLOCK_USER)) 
    }
}

let checkOnwerCourser = async (req, res, next) => {
    try {
        if(req.user.role === 'admin'){
            return next()
        }
        let idCourse = req.headers.idcourse
        let idLesson = req.headers.idlesson
        if(!req.session.listVideo) {
            req.session.listVideo = {}
            req.session.listVideo[req.user._id+idCourse+idLesson] = 0
        }
        //nếu đã từng check segment đầu tiên thì từ lần sau không cần check các segment còn lại
        if(req.session.listVideo[req.user._id+idCourse+idLesson] > 1){
            return next()
        }
    
        //Check segment đầu tiên
        //kiểm tra xem user có sở hữu idLesson trong idCourse này không
        let course = await CourseModel.findOne({
            _id: idCourse,
            account: req.user._id,
            status: 'active'
        }).populate({
            path: 'module'
        })

        if(course && course.module.lessons.includes(idLesson)){
            req.session.listVideo[req.user._id+idCourse+idLesson] += 1
            return next()
        }

        return res.status(400).json(sendError(NOT_PERMISSON));

    } catch (error) {
        return res.status(500).json(sendError(SERVER_ERROR));
    }
}
let canGetOrder = (req, res, next) => {
    if (req.user.role === 'saler' || req.user.role == 'admin' || req.user.role == 'teacher') {
        next();
    } else {
        return res.status(400).json(sendError(NOT_PERMISSON))
    }
}

module.exports = { checkAuth, checkActive,  checkMemberInClass, checkTeacher, checkTeacherInClass, checkAdmin, checkSaler, checkStatusBlockUser, checkOnwerCourser, canGetOrder };