const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const username = process.env.ACCOUNT_EMAIL;
const password = process.env.PASSWORD_EMAIL;

const config = {
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: username,
    pass: password,
  },
};

const viewPath = path.resolve("views");

const transporter = nodemailer.createTransport(config);

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".handlebars",
      partialsDir: viewPath,
      layoutsDir: viewPath,
      defaultLayout: false,
    },
    viewPath: viewPath,
    extName: ".handlebars",
  })
);

function sendForgotPassMail(email, link, name) {
  return sendMail(email, link, name, "Đặt lại mật khẩu của bạn", "forgotpass");
}

function sendBill(email, data) {
  const mailOptions = {
    from: `Nodemy - Học viện đào tạo NodeJS <${process.env.ACCOUNT_EMAIL}>`,
    to: email,
    subject: "Thông báo đăng ký tham gia lớp",
    context: data,
    template: "bill",
  };

  return transporter.sendMail(mailOptions);
}

function sendMail(email, link, name, subject, template) {
  const mailOptions = {
    from: `Nodemy - Học viện đào tạo NodeJS <${process.env.ACCOUNT_EMAIL}>`,
    to: email,
    subject: subject,
    context: {
      link: link,
      name: name,
    },
    template: template,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail, sendForgotPassMail, sendBill };
