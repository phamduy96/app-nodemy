const express = require("express");
const router = express.Router();
const accountModel = require("../models/accounts");
const { sendMail } = require("../services/email");
const { sendError, sendSuccess } = require("../utils/index");
const jwt = require("jsonwebtoken");
const {checkAuth} = require('../Auth/checkAuth')

const {
	UPDATE_STATUS,
	SERVER_ERROR,
	SEND_EMAIL_SUCCESS,
	SEND_EMAIL_FAILED,
} = require("../config/error");

router.get("/:tokenEmail", async function (req, res) {
	var tokenEmailDecode = jwt.verify(
		req.params.tokenEmail,
		process.env.JWT_SECRET
	);
	var user = await accountModel.findOne({_id: tokenEmailDecode});
	if(user && user.status !== "block"){
		accountModel.updateOne(
			{ _id: tokenEmailDecode },
			{ $set: { status: "active" } },
			function (err, data) {
				if (err) res.status(500).json(sendError(UPDATE_STATUS));
				else res.redirect(`${process.env.NODE_ENV !== 'production' ? process.env.FRONTEND_URI_DEV : process.env.FRONTEND_URI}/success-active`)
			}
		);
	}else{
		return res.redirect(`${process.env.NODE_ENV !== 'production' ? process.env.FRONTEND_URI_DEV : process.env.FRONTEND_URI}/block-page`);
	}
	
});

router.get("/", checkAuth, (req, res) => {
	jwt.sign(
		req.user._id.toString(),
		process.env.JWT_SECRET,
		(err, token) => {
			if (err) {
				return res.status(500).json(sendError(SEND_EMAIL_FAILED));
			}
			let link = `${ process.env.NODE_ENV !== 'production' ? process.env.HOST_DOMAIN_DEV : process.env.DOMAIN}/verify/${token}`;
			sendMail(
				req.user.email,
				link,
				req.user.name,
				"Xác thực tài khoản của bạn",
				"verify"
			).then(()=>{
				return res.status(200).json(sendSuccess(SEND_EMAIL_SUCCESS));
			})
			.catch(err =>  {
				return res.status(500).json(sendError(SERVER_ERROR))
			})
		}
	);
});

module.exports = router;
