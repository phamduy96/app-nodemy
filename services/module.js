const CourseModel = require("../models/courses");
const ModuleModel = require("../models/module");

function getAllModule() {
  return ModuleModel.find({}).populate("author", "name avatar");
}

function getAllSellingModule() {
  return ModuleModel.find({
    originalPrice: { $gt: 0 },
  }).populate("author", "name avatar");
}

async function getOwnModuleById(userID) {
  let listCourse = await CourseModel.find({
    status: "active",
    account: userID,
  }).populate({
    path: "module",
    populate: {
      path: "author",
      select: { name: 1, avatar: 1 },
    },
  });

  return listCourse.map((course) => {
    return course.module;
  });
}

function getAllFreeModule() {
  return ModuleModel.find({
    originalPrice: { $gt: 0 },
    salePrice: 0,
  });
}

function createModule(title, description, lessons, points) {
  return ModuleModel.create({
    title,
    description,
    lessons,
    points,
  });
}

function deleteModule(id) {
  return ModuleModel.deleteOne({
    _id: id,
  });
}

function findModule(id) {
  return ModuleModel.findOne({
    _id: id,
  }).populate("author", "name avatar");
}

function updateModule(id, newModule) {
  return ModuleModel.updateOne(
    {
      _id: id,
    },
    newModule
  );
}

function updateVotes(id, votes) {
  return ModuleModel.updateOne(
    {
      _id: id,
      "votes.student": { $ne: votes.student },
    },
    {
      $addToSet: { votes: votes },
    }
  );
}

//hiển thị toàn bộ thông tin module khi người dùng checkout
function getModuleCheckOut(listIdModule) {
  return ModuleModel.find({
    _id: {
      $in: listIdModule,
    },
  });
}
module.exports = {
  createModule,
  getAllModule,
  deleteModule,
  findModule,
  updateModule,
  updateVotes,
  getAllSellingModule,
  getAllFreeModule,
  getModuleCheckOut,
  getOwnModuleById,
};
