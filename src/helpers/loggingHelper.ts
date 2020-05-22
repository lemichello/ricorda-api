import logger from '../logger';
import { ILoggingHelper } from './interfaces/ILoggingHelper';

export default class LoggingHelper implements ILoggingHelper {
  info(message: string, metaData?: object) {
    if (logger) {
      logger.info(message, { meta: { ...metaData } });
    } else {
      console.info(message);
    }
  }

  error(message: string, metaData?: object) {
    if (logger) {
      logger.error(message, { meta: { ...metaData } });
    } else {
      console.error(message);
    }
  }

  debug(message: string, metaData?: object) {
    if (logger) {
      logger.debug(message, { meta: { ...metaData } });
    } else {
      console.debug(message);
    }
  }
}
