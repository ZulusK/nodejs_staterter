// const config = require('@config/config');
const log = require('@config/winston');
// const client = require('twilio')(config.twilioSid, config.twilioToken);

function sendSMS({ to }) {
  // if (config.env !== 'production') {
  log.debug(`Sent sms to ${to} (dev)`);
  return null;
  // }
  // return client.messages.create({ to, body, from: config.twilioPhone }).then((message) => {
  // log.info(`Sent sms to ${to} (prod)`);
  // log.info(message.sid, message);
  // });
}

module.exports = {
  sendSMS
};
