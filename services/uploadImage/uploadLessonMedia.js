const multer=require("multer");
const path=require("path");
const {checkVideoType} = require("./checkDir")

const storageLesson = multer.diskStorage({
    destination: './media',
    filename: function(req, file, cb) {
        cb(null, req.params.id + path.extname(file.originalname))
    }
})

const uploadLesson = multer({
    storage: storageLesson,
    limits: { fileSize: 734003200 },//700MB
    fileFilter: function(req, file, cb) {
        checkVideoType(file, cb);
    }
}).single('file')

module.exports=uploadLesson;