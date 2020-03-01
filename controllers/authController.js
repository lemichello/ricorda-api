const User = require('../models/userModel');
const { createToken } = require('../services/authService');

const logIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    const errorMessage = 'Email or password are incorrect';

    if (!user) {
      return res.status(401).send(errorMessage);
    }

    const matches = await user.checkPassword(req.body.password);

    if (!matches) {
      return res.status(401).send(errorMessage);
    }

    const token = createToken(user);

    return res.status(200).send({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

const signUp = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = createToken(user);

    return res.status(201).send({ token });
  } catch (e) {
    return res.status(400).end();
  }
};

module.exports = {
  logIn,
  signUp
};
