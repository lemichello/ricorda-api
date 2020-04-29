import config from './config/index';
import loggingConfig from './config/loggingOptions';
import { createLogger, Logger } from 'logdna';

let logger: Logger | undefined;

if (config.logDnaKey) {
  logger = createLogger(config.logDnaKey, loggingConfig);
}

export default logger;
