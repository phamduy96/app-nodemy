const multer=require("multer");
const path=require("path");
const {checkFileType} = require("./checkDir")

const storageAvatar = multer.diskStorage({
    destination: './public/uploads/avatar',
    filename: function(req, file, cb) {
        cb(null, "avatar" + '-' + req.params.id + path.extname(file.originalname))
    }
})

const uploadAvatar = multer({
    storage: storageAvatar,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file')

module.exports=uploadAvatar;