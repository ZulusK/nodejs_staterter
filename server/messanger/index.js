const config = require('@config/config');
const log = require('@config/winston');
const client = require('twilio')(config.twilioSid, config.twilioToken);

function sendSMS({ to, body }) {
  if (config.env === 'test') {
    log.debug('SENT');
    return null;
  }
  return client.messages.create({ to, body, from: config.twilioPhone }).then((message) => {
    log.debug('SENT');
    log.debug(message.sid, message);
  });
}

module.exports = {
  sendSMS
};
