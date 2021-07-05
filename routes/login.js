const passport = require('../Auth/passportLocal');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/index');

var {
  LOGIN_FAILED,
  LOGIN_SUCCESS,
  NEED_ACTIVE
} = require('../config/error');

router.get('/', function (req, res, next) {
  res.render('login');
});
/* POST login. */
router.post('/', function (req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json(LOGIN_FAILED);
    }
    delete user.password;

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      // generate a signed son web token with the contents of user object and return it in the response
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 15 * 60 * 1000 });
      return res.status(200).json(sendSuccess(LOGIN_SUCCESS, { user, token }));
    });
  })(req, res);
});

module.exports = router;
