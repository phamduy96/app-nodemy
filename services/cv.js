const cvModel = require('../models/cv')

function getAllCV(){
  return cvModel.find({})
}

function createCV(name, email, account) {
  return cvModel.create({
    name, email, account: account
  })
}

function deleteCV(id){
  return cvModel.deleteOne({
      _id: id
  })
}

function cvDetail(id){
  return cvModel.findOne({
      _id: id
  })
}

function updateCV(id, payload){
  return cvModel.updateOne({
      _id: id
  }, payload)
}

module.exports = {
  getAllCV,
  cvDetail,
  createCV,
  deleteCV,
  updateCV
}