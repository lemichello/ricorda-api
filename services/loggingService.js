const logger = require('../logger');

const loggingService = {
  info: function (message, metaData) {
    if (logger) {
      logger.info(message, { meta: metaData });
    } else {
      console.info(message);
    }
  },
  error: function (message, metaData) {
    if (logger) {
      logger.error(message, { meta: metaData });
    } else {
      console.error(message);
    }
  },
  debug: function (message, metaData) {
    if (logger) {
      logger.debug(message, { meta: metaData });
    } else {
      console.debug(message);
    }
  },
};

module.exports = loggingService;
