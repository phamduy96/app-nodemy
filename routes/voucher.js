const express = require("express");
const router = express.Router();
const voucherRouter = require("../services/voucher");
const { sendError, sendSuccess } = require("../utils/index");
const checkAuth = require("../Auth/checkAuth");
var {
  CREATE_VOUCHER_SUCCESS,
  CREATE_FAILED,
  INVALID_INPUT,
  GET_LIST_DATA_SUCCESS,
  GET_LIST_DATA_FAILED,
  DELETE_FAILED,
  DELETE_SUCCESS,
  UPDATE_SUCCESS,
  UPDATE_FAILED,
} = require("../config/error");

router.get('/', async (req, res, next)=>{
    try {
        var data = await voucherRouter.getAllVoucher()
        return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, data));
    } catch (error) {
        return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
    }
})

router.get("/:txt", async function (req, res, next) {
    try {
      var voucher = await voucherRouter.findVoucherByName(req.params.txt)
      return res.status(200).json(sendSuccess(GET_LIST_DATA_SUCCESS, voucher));
    } catch (error) {
      return res.status(400).json(sendError(GET_LIST_DATA_FAILED));
    }
});

router.post("/", checkAuth.checkAuth, checkAuth.checkAdmin, async function (req, res, next) {
    if (!req.body.name || !req.body.discount || !req.body.expired || !req.body.quantity) return res.status(400).json(sendError(INVALID_INPUT));

    try {
      var newVoucher = await voucherRouter.createVoucher(req.body);
      return res.status(200).json(sendSuccess(CREATE_VOUCHER_SUCCESS, newVoucher));
    } catch (error) {
      return res.status(400).json(sendError(CREATE_FAILED));
    }
  });
  
  router.delete(
    "/:id",
    checkAuth.checkAuth,
    checkAuth.checkAdmin,
    async function (req, res, next) {
      try {
        var voucherDeleted = await voucherRouter.deleteVoucher(req.params.id);
        return res.status(200).json(sendSuccess(DELETE_SUCCESS, voucherDeleted));
      } catch (error) {
        return res.status(400).json(sendError(DELETE_FAILED));
      }
    }
  );
  
  router.put("/:id", checkAuth.checkAuth, checkAuth.checkAdmin, async function (req, res, next) {
    let newVoucher = {};
    if (req.body.name) newVoucher.name = req.body.name;
    if (req.body.discount) newVoucher.discount = req.body.discount;
    if (req.body.quantity) newVoucher.quantity = req.body.quantity;
    if (req.body.expired) newVoucher.expired = req.body.expired;

    try {
      var voucher = await voucherRouter.updateVoucher(req.params.id, newVoucher);
      return res.status(200).json(sendSuccess(UPDATE_SUCCESS, voucher));
    } catch (error) {
      return res.status(400).json(sendError(UPDATE_FAILED));
    }
  });

module.exports= router