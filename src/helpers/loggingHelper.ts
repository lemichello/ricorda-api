import logger from '../logger';

const loggingService = {
  info: function (message: string, metaData?: object) {
    if (logger) {
      logger.info(message, { meta: { ...metaData } });
    } else {
      console.info(message);
    }
  },
  error: function (message: string, metaData?: object) {
    if (logger) {
      logger.error(message, { meta: { ...metaData } });
    } else {
      console.error(message);
    }
  },
  debug: function (message: string, metaData?: object) {
    if (logger) {
      logger.debug(message, { meta: { ...metaData } });
    } else {
      console.debug(message);
    }
  },
};

export default loggingService;
