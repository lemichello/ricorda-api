const User = require('../models/userModel');
const { createToken } = require('../services/authService');
const logger = require('../logger');

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

    res.status(200).send({ token });
    logger && logger.info(`Logged in user with email: ${req.body.email}`);
  } catch (e) {
    logger &&
      logger.error(`Can't log in user with error: ${e}`, {
        meta: { requestData: req.body },
      });
    res.status(500).send('Internal server error');
  }
};

const signUp = async (req, res) => {
  try {
    await User.create(req.body);

    res.status(201).send('Successfully created new word pair');
    logger && logger.info(`Signed up user with email: ${req.body.email}`);
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    logger &&
      logger.error(`Can't sign up user with error: ${e}`, {
        meta: { requestData: req.body },
      });
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  logIn,
  signUp,
};
