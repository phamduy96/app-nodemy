const OrderModel = require("../models/order");
var ModuleModel = require("../models/module");
var SysllabusModel = require("../models/syllabus");
var voucherService = require("../services/voucher");
var _ = require("lodash");

function getTotalValueCourses(listCourses, voucher) {
  let totalPrice = 0;
  let totalTicket = 0;
  listCourses.forEach(function (item) {
    if (item) {
      item.salePrice = item && item.salePrice > 0 ? item.salePrice : 0;
      item.ticket = item && item.ticket > 0 ? item.ticket : 0;
      totalPrice += item.salePrice;
      totalTicket += item.ticket;
    }
  });
  if (voucher) {
    if (voucher.discount <= 100) {
      totalPrice = totalPrice - totalPrice * (parseInt(voucher.discount) / 100);
    } else {
      totalPrice = totalPrice - voucher.discount;
    }
  }
  return { totalPrice, totalTicket };
}

async function createOrder(newOrder) {
  newOrder.created = new Date();
  let listSysllabus = await SysllabusModel.find({
    _id: { $in: newOrder.combo },
  });
  let allCoursesId = [];
  listSysllabus.forEach((sysllabus) => {
    if (sysllabus.modules) {
      allCoursesId = allCoursesId.concat(sysllabus.modules);
    }
  });

  allCoursesId = allCoursesId.concat(newOrder.courses);
  allCoursesId = _.uniq(allCoursesId);
  let listCourses = await ModuleModel.find({ _id: { $in: allCoursesId } });
  let voucher = await voucherService.findVoucherById(newOrder.voucher);
  let totalVal = getTotalValueCourses(listCourses, voucher);
  newOrder.totalPrice = totalVal.totalPrice;
  newOrder.totalTicket = totalVal.totalTicket;
  return OrderModel.create(newOrder);
}

function findOrderById(id) {
  return OrderModel.findOne({ _id: id })
    .populate("courses")
    .populate("voucher")
    .populate({
      path: "combo",
      populate: {
        path: "modules",
        model: "module",
      },
    });
}

function getAllOrders() {
  return OrderModel.find({})
    .populate("courses idAccount")
    .populate({
      path: "combo",
      populate: {
        path: "modules",
        model: "module",
      },
    });
}
function getOrdersByCondition(condition) {
  return OrderModel.find(condition)
    .populate("courses idAccount")
    .populate({
      path: "combo",
      populate: {
        path: "modules",
        model: "module",
      },
    });
}

function updateOrder(id, newOrder) {
  return OrderModel.updateOne({ _id: id }, newOrder);
}

function searchOrder(txt) {
  return OrderModel.find({ $text: { $search: txt } })
    .populate("courses idAccount")
    .populate({
      path: "combo",
      populate: {
        path: "modules",
        model: "module",
      },
    });
}
function deleteOrder(id) {
  return OrderModel.deleteOne({
    _id: id
  })
}
module.exports = {
  createOrder,
  findOrderById,
  getAllOrders,
  getOrdersByCondition,
  updateOrder,
  searchOrder,
  deleteOrder,
};
