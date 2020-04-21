const logger = require('../logger');

const loggingService = {
  info: function (message, metaData) {
    if (!logger) {
      return;
    }

    logger.info(message, { meta: metaData });
  },
  error: function (message, metaData) {
    if (!logger) {
      return;
    }

    logger.error(message, { meta: metaData });
  },
  debug: function (message, metaData) {
    if (!logger) {
      return;
    }

    logger.debug(message, { meta: metaData });
  },
};

module.exports = loggingService;
