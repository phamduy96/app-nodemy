const express = require("express");
const router = express.Router();
const accountModel = require("../models/accounts");
const { sendMail } = require("../services/email");
const { sendError, sendSuccess } = require("../utils/index");
const jwt = require("jsonwebtoken");
const { checkAdmin, checkAuth } = require("../Auth/checkAuth")
const {
	SERVER_ERROR,
	EMAIL_ALREADY_EXISTS,
	SAVE_ACCOUNT_FAILED,
	CREATE_ACCOUNT_SUCCESS,
	SIGNUP_FAILED,
} = require("../config/error");

router.post("/", (req, res) => {
	accountModel.findOne({ email: req.body.email }, (err, data) => {
		if (data) return res.status(401).json(sendError(EMAIL_ALREADY_EXISTS));
		if (err) return res.status(500).json(sendError(SERVER_ERROR));
		if(req.body.role) req.body.role = "user";
		newAccount = new accountModel(req.body);
		newAccount
			.save()
			.then((data) => {
				data = data.toObject();
				delete data.password;
				return jwt.sign(
					data._id.toString(),
					process.env.JWT_SECRET,
					(err, token) => {
						if (err) {
							return res
								.status(500)
								.json(sendError(SAVE_ACCOUNT_FAILED));
						}
						var link = `${process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV  : process.env.DOMAIN }/verify/${token}`;

						sendMail(
							req.body.email,
							link,
							req.body.name,
							"Xác thực tài khoản của bạn",
							"verify"
						);
						return res
							.status(200)
							.json(sendSuccess(CREATE_ACCOUNT_SUCCESS, token));
					}
				);
			})
			.catch((err) => {
				json.status(500).json(sendError(SIGNUP_FAILED));
			});
	});
});

router.post("/admin",checkAuth, checkAdmin ,(req, res) => {
	accountModel.findOne({ email: req.body.email }, (err, data) => {
		if (data) return res.status(401).json(sendError(EMAIL_ALREADY_EXISTS));
		if (err) return res.status(500).json(sendError(SERVER_ERROR));
		newAccount = new accountModel(req.body);
		newAccount
			.save()
			.then((data) => {
				data = data.toObject();
				delete data.password;
				return jwt.sign(
					data._id.toString(),
					process.env.JWT_SECRET,
					(err, token) => {
						if (err) {
							return res
								.status(500)
								.json(sendError(SAVE_ACCOUNT_FAILED));
						}
						var link = `${process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV  : process.env.DOMAIN }/verify/${token}`;

						sendMail(
							req.body.email,
							link,
							req.body.name,
							"Xác thực tài khoản của bạn",
							"verify"
						);
						return res
							.status(200)
							.json(sendSuccess(CREATE_ACCOUNT_SUCCESS, data));
					}
				);
			})
			.catch((err) => {
				json.status(500).json(sendError(SIGNUP_FAILED));
			});
	});
});

module.exports = router;
