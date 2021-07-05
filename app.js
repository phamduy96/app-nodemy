require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");

const passport = require("./Auth/passportLocal");
const passportFacebook = require("./Auth/passportFacebook");
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const loginFacebookRouter = require("./routes/loginFacebook");
const loginGoogleRouter = require("./routes/loginGoogle");
const singupRouter = require("./routes/signup");
const changePassRouter = require("./routes/changepass");
const usersRouter = require("./routes/users");
const scoreRouter = require("./routes/score");
const verifyRouter = require("./routes/verify");
const redisClient = require("./config/redis");
const classRouter = require("./routes/class");
const syllabusRouter = require("./routes/syllabus");
const lessonRouter = require("./routes/lesson");
const moduleRouter = require("./routes/module");
const salerRouter = require("./routes/saler");
const cvRouter = require("./routes/cv");
const questionRouter = require("./routes/questionSystem/question");
const examResultRouter = require("./routes/questionSystem/examResult");
const examRouter = require("./routes/questionSystem/exam");
const orderRouter = require("./routes/order");
const courseRouter = require("./routes/course");
const voucherRouter = require("./routes/voucher");
const questionSupporRouter = require("./routes/support/question/questionSupport");
const tagQuestionSupporRouter = require("./routes/support/question/tagQuestionSupport");
const attendentRouter = require("./routes/attendent")
const {
  checkAuth,
  checkActive,
  checkStatusBlockUser,
  checkOnwerCourser,
  checkAdmin,
} = require("./Auth/checkAuth");

// const googleAuth = require('./Auth/passportGoogle')

// const googleAuth = require('./Auth/passportGoogle')
const { router } = require("bull-board");
const ckeditor = require("./routes/ckeditor");
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(passportFacebook.initialize());
app.use(passportFacebook.session());
// bull ui
app.use(
  "/admin/queues",
  (req, res, next) => {
    req.proxyUrl = "/api/admin/queues";
    next();
  },
  router
);
app.use("/public", express.static(path.join(__dirname + "/public")));
app.use("/ckeditor-upload-img", ckeditor);

app.use("/support/question", questionSupporRouter);
app.use("/support/tag-question-support", tagQuestionSupporRouter);
// account not login
app.use("/signup", singupRouter);
app.use("/login", loginRouter);
// app.use("/", loginFacebookRouter);
// app.use("/", loginGoogleRouter);
app.get("/logout", async (req, res) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      await redisClient.LPUSH("token", token);
      return res.status(200).json({
        status: 200,
        data: "You are logged out",
      });
    } catch (error) {
      return res.status(400).json({
        status: 500,
        error: error.toString(),
      });
    }
  } else {
    return res.status(301).json({
      status: 301,
      error: "invalid token",
    });
  }
});

// checkAuth manually each router
app.use("/verify", verifyRouter);
app.use("/users", usersRouter);
app.use("/score", scoreRouter);
app.use("/cv", cvRouter);
app.use("/module", moduleRouter);
app.use("/order", orderRouter);
app.use("/course", courseRouter);
app.use("/voucher", voucherRouter);

// checkAuth checkActive
app.use(checkAuth);
app.use(checkActive);
app.use(checkStatusBlockUser);

app.use("/", indexRouter);
app.use("/class", classRouter);
app.use("/changepass", changePassRouter);
app.use("/saler", salerRouter);
app.use("/syllabus", syllabusRouter);
app.use("/lesson", lessonRouter);
app.use("/question", questionRouter);
app.use("/exam-result", examResultRouter);
app.use("/exam", examRouter);
app.use("/attendent", attendentRouter);

app.use(
  function (req, res, next) {
    if (req.url.indexOf("/mediadeliver") != -1) {
      checkAuth(req, res, next);
    } else {
      next(createError(404));
    }
  },
  function (req, res, next) {
    checkOnwerCourser(req, res, next);
  }
);

app.use("/mediadeliver", express.static(path.join(__dirname + "/media")));

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
