const pug = require('pug');

const nodemailer = require('nodemailer');
const config = require('@config/config');
const log = require('@config/winston')(module);
const path = require('path');

const emailTemplateFunc = pug.compileFile(path.join(config.publicDir, 'emailVerification.pug'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: config.emailAddress,
    pass: config.emailPassword
  }
});

transporter.verify((error) => {
  if (error) {
    log.error(error);
  } else {
    log.info('Server is ready to send messages');
  }
});

/**
 * Create new user
 * @property {string} email - The email of user.
 * @property {string} fullname - The username of user.
 * @property {string} token - generated token of user
 * @returns {User}
 */
function sendEmailActivation({ email, token, fullname }) {
  const renderedText = emailTemplateFunc({
    email,
    token,
    fullname,
    host: config.host
  });
  const mail = {
    from: config.emailAddress,
    to: email,
    subject: 'Confirm your email',
    html: renderedText
  };
  log.info(`Sent mail to ${email}`);
  transporter.sendMail(mail);
}

module.exports = {
  // sendEmailActivation: config.env === 'production'
  // ? sendEmailActivation : () => {} // send mails only in production
  sendEmailActivation
};
