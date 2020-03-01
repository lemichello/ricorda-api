const env = process.env.NODE_ENV || 'development';

let config = {};

switch (env) {
  case 'dev':
  case 'development':
    config = require('./dev');
    break;

  case 'prod':
  case 'production':
    config = require('./prod');
    break;

  default:
    config = require('./dev');
}

module.exports = config;
