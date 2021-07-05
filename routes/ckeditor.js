let router = require("express").Router();
const multer = require("multer")
let path = require("path");
let { v4: uuidv4 } = require('uuid')
let {sendError} = require("../utils/index");
let { UPLOAD_FAILED, NO_FILE_SELECT } = require("../config/error")
let storage = multer.diskStorage({
	destination: './public/uploads/ck',
	filename: function(req, file, cb) {
		cb(null,  'ck-image-' + uuidv4() + path.extname(file.originalname))
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
  }).single('upload')



router.post("/", function(req,res){
    upload(req, res, async (err) => {
		if (err){
			return res.status(500).json(sendError(UPLOAD_FAILED));
		} 
		if (req.file === undefined) return res.status(400).json(sendError(NO_FILE_SELECT));
		let url = process.env.NODE_ENV !== "production" ?  `${process.env.HOST_DOMAIN_DEV}/public/uploads/ck/${req.file.filename}` :  `${process.env.HOST_DOMAIN}/public/uploads/ck/${req.file.filename}`
        return res.status(200).json({url})
    })
})
module.exports = router