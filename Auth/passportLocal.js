const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const AccountModel = require('../models/accounts');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const clientRedis = require('../config/redis');
const util = require('util');
clientRedis.get = util.promisify(clientRedis.get);

var tokenExtractor = async function (req) {
  var token = null;
  if (req.cookies && req.cookies['token']) {
    token = req.cookies['token'];
  }

  if (req.body.token) {
    token = req.body.token;
  }

  var authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
    token = authHeader.substring(7, authHeader.length);
  }

  return token;
};
var opts = {};
opts.jwtFromRequest = tokenExtractor;
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) => {
      AccountModel.findOne({ email: email }).exec(function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        user.comparePassword(password, function (err, isMatch) {
          if (err) return done(null, false, { message: 'server error.' });

          if (isMatch) {
            return done(null, user.toObject());
          } else {
            return done(null, false, { message: 'password wrong.' });
          }
        });
      });
    },
  ),
);

passport.use(
  new JWTStrategy(opts, function (jwtPayload, cb) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return AccountModel.findById(jwtPayload._id)
      .then((user) => {
        return cb(null, user);
      })
      .catch((err) => {
        return cb(err);
      });
  }),
);

module.exports = passport;
