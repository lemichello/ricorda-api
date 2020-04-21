const config = require('./config/index');
const loggingConfig = require('./config/loggingOptions');
const Logger = require('logdna');
let logger;

if (config.logDnaKey) {
  logger = Logger.createLogger(config.logDnaKey, loggingConfig);
}

module.exports = logger;
