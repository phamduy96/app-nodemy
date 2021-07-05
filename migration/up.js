// let mongoose = require('mongoose')
const CourseModel = require('../models/courses');
const AccountModel = require('../models/accounts');
const ModuleModel = require('../models/module');
const _ = require('lodash');

var data = require('./account_200.json')
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}
setTimeout(function() {
  (async function () {
    // thêm user beta
    AccountModel.insertMany(data).then(e=>{
    }).catch(err=>{
      console.log(err);
    })


    // ========================= thêm học viên và comment vào khóa học
    let listModule = await ModuleModel.find({
      originalPrice: { $gte : 0 },
      salePrice: { $gte : 0 }
    })
  
    let listUser = await AccountModel.find({version: 'beta'})
  
    for (let i = 0; i < listModule.length; i++) {
      let module = listModule[i];
      
      // lay ngau nhien 130 - 200 ban vao tung lop
      var randomAmountStd = randomIntFromInterval(130, listUser.length)
      var listStudentJoinClass = _.sampleSize(listUser, randomAmountStd)
      var arrCourse = listStudentJoinClass.map(std=>{
        return {
          "status" : "active",
          "created" : new Date(),
          "account" : std._id,
          "module" : module._id,
          "result" : [],
        }
      })
  
      //add hoc sinh vao lop
      await CourseModel.insertMany(arrCourse)
      
      //them comment 
      var commentData = require('./student_comment.json')
      var cmtrate4 = _.shuffle(commentData.rate4)
      var cmtrate45 = _.shuffle(commentData.rate45)
      var cmtrate5 = _.shuffle(commentData.rate5)
      // lay ngau nhien 1/2 lop comment
      let halfOfClass = Math.floor(listStudentJoinClass.length/2)
      randomAmountStd = randomIntFromInterval(halfOfClass - 20 , halfOfClass) 
      var listStudentComment = _.sampleSize(listStudentJoinClass, randomAmountStd)
      var listComment = listStudentComment.map(item=>{
        let rate = _.sample([4, 4.5, 4.5, 5, 5, 5])
        let comment = rate == 5 ? cmtrate5.pop() : rate == 4.5 ? cmtrate45.pop() : cmtrate4.pop()
        comment = comment ? comment : ""
        return {
          student: item._id,
          rate: rate,
          comment: comment
        }
      })
      module.votes = module.votes.concat(listComment)
      await module.save()
      console.log('up ok');
    }
    
  })();
  
}, 1000);