const multer=require("multer");
const path=require("path");
const {checkFileType} = require("./checkDir")
const { v4: uuidv4 } = require('uuid');

const storageQuestionSupport = multer.diskStorage({
    destination: './public/uploads/questionSupport',
    filename: function(req, file, cb) {
        cb(null, "questionSupport" + '-' + uuidv4() + path.extname(file.originalname))
    }
})

const uploadQuestionSupport = multer({
    storage: storageQuestionSupport,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('questionSupport')

module.exports = uploadQuestionSupport;