const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const AccountModel = require("../models/accounts");

passport.serializeUser((user, done) => {
	done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser((id, done) => {
	AccountModel.findOne({ facebookId: id }, (err, user) => {
		done(err, user);
	});
});

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: process.env.CALLBACK_URL,
			profileFields: ["id", "displayName", "photos", "email"],
		},
		(accessToken, refreshToken, profile, done) => {
			process.nextTick(async () => {
				try {
					// Kiểm tra facebookId đã tồn tại trong db chưa
					let user = await AccountModel.findOne({
						facebookId: profile._json.id,
					});
					// Nếu đã tồn tại => thành công
					if (user) {
						return done(null, user);
					}
					// Nếu chưa => check tiếp email
					else {
						let fbEmail =
							profile._json.email !== undefined
								? profile._json.email
								: `${profile._json.id}@gmail.com`;
						let checkEmail = await AccountModel.findOne({
							email: fbEmail,
						});
						// Nếu tồn tại
						if (checkEmail) {
							// Tạo tài khoản mới (không có email)
							let data = await AccountModel.create({
								facebookId: profile._json.id,
								name: profile._json.displayName,
								email: profile._json.id + '@gmail.com',
								avatar: profile._json.picture.data.url,
								status: "active",
							});
							return done(null, data);
						} else {
							// Tạo tài khoản mới có email
							let data = await AccountModel.create({
								facebookId: profile._json.id,
								email: fbEmail,
								name: profile._json.displayName,
								avatar: profile._json.picture.data.url,
								status: "active",
							});
							return done(null, data);
						}
					}
				} catch (error) {
					return done(error);
				}
			});
		}
	)
);

module.exports = passport;
