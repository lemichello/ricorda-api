import devConfig from './dev';
import prodConfig from './prod';
import IConfig from './config';

const env = process.env.NODE_ENV || 'development';

let config: IConfig;

switch (env) {
  case 'dev':
  case 'development':
    config = devConfig;
    break;

  case 'prod':
  case 'production':
    config = prodConfig;
    break;

  default:
    config = devConfig;
}

export default config;
