const config = require('@config/config');
const log = require('@config/winston');
const client = require('twilio')(config.twilioSid, config.twilioToken);

function sendSMS({ to, body }) {
  if (config.env !== 'production') {
    log.debug(`Sent sms to ${to} (dev)`);
    return null;
  }
  return client.messages.create({ to, body, from: config.twilioPhone }).then((message) => {
    log.debug(`Sent sms to ${to} (prod)`);
    log.debug(message.sid, message);
  });
}

module.exports = {
  sendSMS
};
