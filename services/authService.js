const User = require('../models/userModel');
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

const protect = async function(req, res, next) {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).send("Bearer token isn't provided");
  }

  let payload;
  const token = bearer.split('Bearer ')[1].trim();

  try {
    payload = await verityToken(token);
  } catch (e) {
    return res.status(401).send('You are not logged in');
  }

  const user = await User.findById(payload.id)
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end();
  }

  req.user = user;
  next();
};

module.exports = {
  createToken,
  verityToken,
  protect
};
