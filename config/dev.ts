import IConfig from './config';

const devConfig: IConfig = {
  dbUrl: 'mongodb://localhost:27017/ricorda',
  secrets: {
    accessTokenSecret: 'optvBdTsFDFhV4KwfCBxPa',
    refreshTokenSecret: 'n7UU9prJefTBV6YbAPWTMZ',
  },
  logDnaKey: '',
  secureCookies: false,
};

export default devConfig;
