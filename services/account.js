var accountModel = require("../models/accounts");
const ClassModel = require("../models/class");

function getAll() {
  return accountModel.find();
}

function getUserOfPage(query) {
  let { current, pageSize, role } = query;
  if ((role && role.length == 2) || !role) {
    return accountModel
      .find({
        $or: [{ role: "teacher" }, { role: "user" }, { role: "saler" }],
      })
      .skip((parseInt(current) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .exec();
  } else {
    return accountModel
      .find({ role: role })
      .skip((parseInt(current) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .exec();
  }
}

function createAccount(email, password, name, role) {
  return accountModel.create({
    email: email,
    password: password,
    name: name,
    role: role,
  });
}

function deleteAccount(id) {
  return accountModel.deleteOne({ _id: id });
}

function editAccount(id, userInfo) {
  return accountModel.updateOne({ _id: id }, userInfo, { new: true });
}

function addFeedback(idTeacher, vote) {
  return accountModel.updateOne(
    { _id: idTeacher },
    {
      $push: { votes: vote },
    },
    { new: true }
  );
}

function updatePassword(id, newPassword) {
  return accountModel.updateOne(
    { _id: id },
    { password: newPassword },
    { new: true }
  );
}

function checkID(id) {
  return accountModel.findById({ _id: id }).select({ password: 0 });
}

function findAndPopulate(id) {
  return accountModel.findById(id).populate("cvs").exec();
}

function getUser(email) {
  return accountModel.find({ email: email });
}

function getName(name) {
  return accountModel.find({ name: name });
}

function getAllStudent() {
  return accountModel.find({ role: "user" });
}
function getStudentsByEmails(emails) {
  return accountModel.find({
    email: {
      $in: emails,
    },
    role: "user",
  });
}

function getAllTeacher() {
  return accountModel.find({
    role: "teacher",
  });
}
async function getTeacherByClassId(classId) {
  let teacherId = await ClassModel.findOne({ _id: classId });
  let teacher = await accountModel.findById(teacherId.teacher);
  return teacher;
}
function updateStatus(idUser, status) {
  var statusNeedUpdate = "active";
  if (status === "active") {
    statusNeedUpdate = "block";
  }
  if (status === "block") {
    statusNeedUpdate = "active";
  }
  return accountModel.updateOne({ _id: idUser }, { status: statusNeedUpdate });
}
function updateRole(idUser, roleNeedUpdate) {
  return accountModel.updateOne({ _id: idUser }, { role: roleNeedUpdate });
}

function increaseTicketOfUser(idUser) {
  return accountModel.findByIdAndUpdate(idUser, { $inc: { ticket: 1 } }).exec();
}
function minusTicketOfUser(idUser) {
  var condition = {
    _id: idUser,
    ticket: { $gt: 0 },
  };
  return accountModel
    .findOneAndUpdate(condition, { $inc: { ticket: -1 } })
    .exec();
}
function getListStaff(){
  return accountModel.find({
    $or : [
        {
            role: "admin"
        },
        {
            role: "saler"
        },
        {
            role: "teacher"
        }
    ]
    },{
        password: 0
    })
}
function getDetailStaff(id){
  return accountModel.findOne({
    _id: id
  },{
      password: 0
  })
}
function updateDaysOff(idStaff, daysOff, abreak){
  return accountModel.updateOne({
    _id: idStaff
  },{
    daysOff: daysOff - abreak
  })
}
module.exports = {
  createAccount: createAccount,
  deleteAccount: deleteAccount,
  editAccount: editAccount,
  getUserOfPage,
  checkID: checkID,
  getUser: getUser,
  getName: getName,
  updatePassword: updatePassword,
  getAllStudent: getAllStudent,
  getStudentsByEmails: getStudentsByEmails,
  findAndPopulate,
  getAllTeacher,
  getTeacherByClassId,
  getAll,
  updateStatus,
  increaseTicketOfUser,
  minusTicketOfUser,
  addFeedback,
  getListStaff,
  getDetailStaff,
  updateDaysOff,
  updateRole
};
