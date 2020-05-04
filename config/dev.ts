import IConfig from './config';

const devConfig: IConfig = {
  dbUrl: 'mongodb://localhost:27017/ricorda',
  secrets: {
    accessTokenSecret: 'optvBdTsFDFhV4KwfCBxPa',
    refreshTokenSecret: 'n7UU9prJefTBV6YbAPWTMZ',
  },
  logDnaKey: '',
  googleClientId:
    '1095009919728-drr0i1k90d7oodtffc8prrt7n6528n42.apps.googleusercontent.com',
  secureCookies: false,
};

export default devConfig;
