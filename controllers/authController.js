const User = require('../models/userModel');
const { createToken } = require('../services/authService');

const logIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    const errorMessage =
      'You have entered incorrect email or password. Try again';

    if (!user) {
      return res.status(400).send(errorMessage);
    }

    const matches = await user.checkPassword(req.body.password);

    if (!matches) {
      return res.status(400).send(errorMessage);
    }

    const token = createToken(user);

    return res.status(200).send({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).send('Internal server error');
  }
};

const signUp = async (req, res) => {
  try {
    await User.create(req.body);

    return res.status(201).end();
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  logIn,
  signUp
};
