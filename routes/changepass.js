const express = require("express");
const router = express.Router();
const accountModel = require("../models/accounts");
const { checkAuth } = require("../Auth/checkAuth");
const bcrypt = require("bcrypt");
const { sendError, sendSuccess } = require("../utils/index");
const { SERVER_ERROR } = require("../config/error");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// Change password
router.post("/", (req, res) => {
	const current_password = req.body.current_password;
	const newPassword = req.body.password;
	const newPassword_confirmation = req.body.password_confirmation;
	accountModel
		.findById(req.user._id)
		.then((data) => {
			if (bcrypt.compareSync(current_password, data.password) === true) {
				if (newPassword == newPassword_confirmation) {
					if (
						bcrypt.compareSync(newPassword, data.password) === false
					) {
						accountModel
							.updateOne(
								{ _id: req.user._id },
								{ password: bcrypt.hashSync(newPassword, salt) }
							)
							.then((data) =>
								res.status(200).json({
									statusCode: 200,
									message: "Change password success",
								})
							)
							.catch((err) =>
								res.status(500).json(sendError(SERVER_ERROR))
							);
					} else {
						return res.status(400).json({
							statusCode: 400,
							message:
								"The new password needs a different password",
						});
					}
				} else {
					return res.status(400).json({
						statusCode: 400,
						message: "Password confirm need same with new password",
					});
				}
			} else {
				return res.status(400).json({
					statusCode: 400,
					message: "Current password wrong",
				});
			}
		})
		.catch((err) => res.status(500).json(sendError(SERVER_ERROR)));
});

module.exports = router;
