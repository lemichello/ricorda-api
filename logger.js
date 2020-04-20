const config = require('./config/index');
const loggingConfig = require('./config/loggingOptions');
const Logger = require('logdna');
let logger;

// Fails only on localhost (without ingestion key).
try {
  logger = Logger.createLogger(config.logDnaKey, loggingConfig);
} catch (e) {
  logger = null;
}
module.exports = logger;
