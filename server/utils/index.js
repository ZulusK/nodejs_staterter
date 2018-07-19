function genOtp(len = 4) {
  return Math.floor(Math.random() * (Math.pow(10, len - 1) * 9)) + Math.pow(10, len - 1);
}

module.exports = {
  genOtp
};
