const User = require('../models/userModel');
const logger = require('../services/loggingService');

const updatePassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;

  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).send('Incorrect type of old or new passwords');
  }

  let user = await User.findById(req.user._id);
  let correctOldPassword = await user.checkPassword(oldPassword);

  if (!correctOldPassword) {
    return res.status(400).send('Incorrect old password');
  }

  try {
    user.password = newPassword;
    user.save();

    logger.info(`Changed password for user: ${req.user._id}`);
    res.status(200).send('Successfully updated password');
  } catch (e) {
    logger.error(`Can't update password for user: ${e}`, {
      userId: req.user._id,
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
    res.status(500).send('Internal server error');
  }
};

const updateEmail = async (req, res) => {
  let { newEmail } = req.body;

  if (typeof newEmail !== 'string') {
    return res.status(400).send('Incorrect type of new email');
  }

  try {
    await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      { email: newEmail },
      { new: true, useFindAndModify: false }
    )
      .lean()
      .exec();

    logger.info(`Changed email for user: ${req.user._id}`);
    res.status(200).send('Successfully updated email');
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    logger.error(`Can't update email for user: ${e}`, {
      userId: req.user._id,
      newEmail: newEmail,
    });
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  updatePassword,
  updateEmail,
};
