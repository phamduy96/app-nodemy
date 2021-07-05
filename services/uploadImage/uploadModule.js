const multer=require("multer");
const path=require("path");
const {checkFileType} = require("./checkDir")

const storageModule = multer.diskStorage({
    destination: './public/uploads/modules',
    filename: function(req, file, cb) {
        cb(null, "upload" + path.extname(file.originalname))
    }
})

const uploadModule= multer({
    storage: storageModule,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file')

module.exports=uploadModule;