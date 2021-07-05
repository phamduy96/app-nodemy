const passport = require("passport");
const AccountModel = require('../models/accounts')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_APP_ID,
        clientSecret: process.env.GOOGLE_APP_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async function(accessToken, refreshToken, profile, done) {
        try {
            // Kiểm tra googleId đã tồn tại trong db chưa
            let user = await AccountModel.findOne({
                googleId: profile._json.sub,
            });
            // Nếu đã tồn tại => thành công
            if (user) {
                return done(null, user);
            }
            // Nếu chưa => check tiếp email
            else {
                let googleEmail = profile._json.email
                   
                let checkEmail = await AccountModel.findOne({
                    email: googleEmail,
                });
                // Nếu tồn tại
                if (checkEmail) {
                    // Tạo tài khoản mới (email = idGoogle@gmail.com)
                    let data = await AccountModel.create({
                        googleId: profile._json.sub,
                        name: profile._json.name,
                        email: profile._json.sub + '@gmail.com',
                        avatar: profile._json.picture,
                        status: "active",
                    });
                    return done(null, data);
                } else {
                    // Tạo tài khoản mới có email
                    let data = await AccountModel.create({
                        googleId: profile._json.sub,
                        email: googleEmail,
                        name: profile._json.name,
                        avatar: profile._json.picture,
                        status: "active",
                    });
                    return done(null, data);
                }
            }
        } catch (error) {
            return done(error);
        }
      }
    )
  );