const passport = require("../Auth/passportFacebook");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { LOGIN_FAILED } = require("../config/error");
const utf8 = require('utf8');

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/plus.login"],
  })
);

router.get("/auth/google/callback", (req, res) => {
  passport.authenticate("google", (err, user, info) => {
   
    if (err || !user) {
      return res.status(400).json(LOGIN_FAILED);
    }
    delete user.password;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 15 * 60 * 1000,
    });
    let options = {
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes,
      encode: function(val){
        
        return utf8.encode(val)
      }
    };
    user = JSON.stringify(user)
    res.cookie("accessToken", token, options);
    res.cookie("user", user, options);
    
    return res.redirect(`${process.env.NODE_ENV !== 'production' ? process.env.FRONTEND_URI_DEV : process.env.FRONTEND_URI}`)
  })(req, res);
});

module.exports = router;
