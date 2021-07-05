const fs=require("fs");
const path=require("path");

const dir={
    urlIndex:"public/uploads",
    urlAvatar:"public/uploads/avatar",
    urlModule:"public/uploads/modules",
    urlQuestionSupport:"public/uploads/questionSupport"
}
const checkDir=()=>{
    const dirIndex=path.join(__dirname,`../../${dir.urlIndex}`)
    const dirAvatar=path.join(__dirname,`../../${dir.urlAvatar}`)
    const dirModule=path.join(__dirname,`../../${dir.urlModule}`)
    const dirQuestionSupport = path.join(__dirname,`../../${dir.urlQuestionSupport}`)
    if (!fs.existsSync(dirIndex)) {
        fs.mkdirSync(dirIndex,{ recursive: true });
      }
    if (!fs.existsSync(dirAvatar)) {
        fs.mkdirSync(dirAvatar,{ recursive: true });
      }
    if (!fs.existsSync(dirModule)) {
        fs.mkdirSync(dirModule,{ recursive: true });
    }
    if (!fs.existsSync(dirQuestionSupport)) {
      fs.mkdirSync(dirQuestionSupport,{ recursive: true });
    }
    return;
};

const checkFileType=(file, cb) =>{
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      cb('Error: Image Only!')
  }
}

const checkVideoType=(file, cb) =>{
  const filetypes = /wmv|mp4|avi|flv|mov/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
      return cb(null, true);
  } else {
      cb('Error: Image Only!')
  }
}

const clearImageOld=(path,file)=>{
   if (file) {
    return fs.unlinkSync(`${path}/${file}`);
   }
}

const reNameImage=(id)=>{
  var url="";
  var fileOld=""
  var status=false;
  var count=0;
  const dirModule=path.join(__dirname,`../../${dir.urlModule}`)
  const files=fs.readdirSync(dirModule);
  files.forEach((file)=>{
    if (file.split(".")[0]===id) {
      fileOld=file;
    }
    if (file.split(".")[0]==="upload") {
      let changeUrl=`${dirModule}/${id}.${file.split(".")[1]}`;
      fs.renameSync(`${dirModule}/${file}`,changeUrl)
      count=0;
    }else{
      count++;
    }
    if (count===0) {
      status=true;
      url=`public/uploads/modules/${id}.${file.split(".")[1]}`;
      return;
    }
  })
  if (status) {
    clearImageOld(dirModule,fileOld);
  }
  return url;
}

module.exports= {
  checkDir,
  checkFileType,
  reNameImage,
  checkVideoType
};