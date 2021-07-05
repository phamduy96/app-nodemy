// let mongoose = require('mongoose')
const CourseModel = require('../models/courses');
const AccountModel = require('../models/accounts');
const ModuleModel = require('../models/module');
const _ = require('lodash');


setTimeout(async function() {
  
    // xóa user beta đã tham gia course
    let listUserBeta = await AccountModel.find({version: 'beta'})
    listUserBeta = listUserBeta.map(item=>{ return item._id + '' })
    await CourseModel.deleteMany({
      account: {$in: listUserBeta}
    })
    
    let listModule = await ModuleModel.find({
      originalPrice: { $gte : 0 },
      salePrice: { $gte : 0 }
    })

    // xóa user beta comment trong các khóa học
    for (let i = 0; i < listModule.length; i++) {
      let module = listModule[i];
      let realVote = module.votes.filter(vote=>{
        return !listUserBeta.includes(vote.student)
      })
      module.votes = realVote
      module.save()
    }

    // xóa user beta
    AccountModel.deleteMany({
      version: 'beta'
    }).then(ok=>{
      console.log(ok);
    })
    .catch(err=>{
      console.log(err);
    })
}, 1000);