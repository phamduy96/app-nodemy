var express = require("express");
var router = express.Router();
const orderService = require("../services/order");
const courseService = require("../services/courses");
const accountService = require("../services/account");
const moduleService = require("../services/module");
const voucherService = require("../services/voucher");
const mailService = require("../services/email");
const { sendError, sendSuccess } = require("../utils/index");
const checkAuth = require("../Auth/checkAuth");
var {
  DELETE_SUCCESS,
  SERVER_ERROR,
  GET_DATA_SUCCESS,
  CREATE_ORDER_SUCCESS,
} = require("../config/error");
const OrderModel = require("../models/order");

router.post("/", async function (req, res, next) {
  try {
    let newOrder = {
      idAccount: req.body.idAccount,
      combo: req.body.combo,
      courses: req.body.courses,
      contact: req.body.contact,
      voucher: req.body.voucher,
    };
    let addCourseProcess = courseService.createManyCoursesWithOrder(newOrder);
    let addOrderProcess = orderService.createOrder(newOrder);
    await addCourseProcess;
    let data = await addOrderProcess;
    if (req.body.voucher)
      await voucherService.caculationVoucher(req.body.voucher);

    let sendModule = await moduleService
      .getModuleCheckOut(req.body.courses)
      .then((data) => {
        let info = [];
        data.forEach((element) => {
          info.push({
            title: element.title,
            description: element.description,
            originalPrice: element.originalPrice,
            salePrice: element.salePrice,
            ticket: element.ticket,
            image: element.image,
          });
        });
        return info;
      })
      .then((data) => {
        let totalTicket = 0;
        let totalPrice = 0;
        let detail = [];
        detail;
        for (let i = 0; i < data.length; i++) {
          let image = data[i].image;
          let title = data[i].title;
          detail[i] = { image: image, title: title };
          totalTicket = totalTicket + data[i].ticket;
          totalPrice = totalPrice + data[i].salePrice;
        }
        return {
          detail: detail,
          totalTicket: totalTicket,
          totalPrice: totalPrice,
        };
      });

    let totalPrice = data.totalPrice
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (sendModule.totalPrice > data.totalPrice) {
      sendModule.totalPrice = sendModule.totalPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      sendModule.totalPrice = false;
    }

    let email = "";
    await accountService.checkID(req.body.idAccount).then((data) => {
      email = data.email;
    });
    let sendMailData = {
      detail: sendModule.detail,
      combo: req.body.combo,
      courses: req.body.courses,
      originPrice: sendModule.totalPrice,
      totalPrice: totalPrice,
      totalTicket: sendModule.totalTicket,
      idAccount: req.body.idAccount,
      contact: req.body.contact,
      code: data.code,
      email: email,
      bill: data._id,
    };

    mailService.sendBill(email, sendMailData);

    res.json(sendSuccess(CREATE_ORDER_SUCCESS, data));
  } catch (error) {
    console.log(error);
    res.status(500).json(sendError(SERVER_ERROR));
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var data = await orderService.findOrderById(req.params.id);
    res.json(sendSuccess(GET_DATA_SUCCESS, data));
  } catch (error) {
    res.status(500).json(sendError(SERVER_ERROR));
  }
});

router.get(
  "/",
  checkAuth.checkAuth,
  checkAuth.canGetOrder,
  async function (req, res, next) {
    try {
      var status = req.query.status;
      var data = null;
      if (status !== "review" && status !== "done") {
        data = await orderService.getAllOrders();
      } else {
        data = await orderService.getOrdersByCondition({ status: status });
      }

      res.json(sendSuccess(GET_DATA_SUCCESS, data));
    } catch (error) {
      res.status(500).json(sendError(SERVER_ERROR));
    }
  }
);

router.put(
  "/courses",
  checkAuth.checkAuth,
  checkAuth.checkSaler,
  async function (req, res, next) {
    try {
      var idAccount = req.body.idAccount;
      var courses = req.body.courses;
      var idOrder = req.body.idOrder;
      var totalTicket = req.body.totalTicket;
      var currentTicket = 0;
      await courseService.activeManyCourses(idAccount, courses);
      let user = await accountService.checkID(idAccount);
      if (user.ticket) {
        currentTicket = user.ticket;
      }
      let newTicket = currentTicket + parseInt(totalTicket);
      let updateTicket = {
        ticket: newTicket,
      };
      await accountService.editAccount(idAccount, updateTicket);
      await orderService.updateOrder(idOrder, { activeAllCourses: true });
      res.json(sendSuccess(GET_DATA_SUCCESS));
    } catch (error) {
      res.status(500).json(sendError(SERVER_ERROR));
    }
  }
);

router.put("/:id", async function (req, res, next) {
  try {
    var idOrder = req.params.id;
    var newOrder = {};
    if (req.body.status) newOrder.status = req.body.status;
    await orderService.updateOrder(idOrder, newOrder);

    res.json(sendSuccess(GET_DATA_SUCCESS));
  } catch (error) {
    res.status(500).json(sendError(SERVER_ERROR));
  }
});

router.get("/search/:q", async function (req, res, next) {
  try {
    var textSearch = req.params.q;
    let data = await orderService.searchOrder(textSearch);
    res.json(sendSuccess(GET_DATA_SUCCESS, data));
  } catch (error) {
    res.status(500).json(sendError(SERVER_ERROR));
  }
});
router.delete("/:id", async (req, res)=>{
  try {
    let idAccount = req.body.idAccount
    let id = req.params.id
    let cources = req.body.courses
    let module = [];
    for(let i = 0; i < cources.length; i++){
      module.push(cources[i].id)
    }
    await courseService.deleteCourse(idAccount, module)
    await orderService.deleteOrder(id)
    res.json(sendSuccess(DELETE_SUCCESS));
  } catch (error) {
    res.status(500).json(sendError(SERVER_ERROR));
  }
})
module.exports = router;
