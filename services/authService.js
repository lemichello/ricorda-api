const jwt = require('jsonwebtoken');
const config = require('../config/index');

const createToken = function(user) {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExpires
  });
};

const verityToken = function(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) {
        return reject(err);
      }

      resolve(payload);
    });
  });
};

module.exports = {
  createToken,
  verityToken
};
