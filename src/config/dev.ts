import IConfig from './config';

const devConfig: IConfig = {
  dbUrl: 'mongodb://localhost:27017/ricorda',
  webApplicationUrl: 'http://localhost:3001',
  apiRootUrl: 'http://localhost:3000',
  projectId: 'ricorda-cfbe2',
  emailSenderAccount: {
    user: 'hosea.homenick39@ethereal.email',
    password: 'U1qZTkQaugHCSHSYYB',
    service: undefined,
    host: 'smtp.ethereal.email',
    port: 587,
  },
  secrets: {
    accessTokenSecret: 'optvBdTsFDFhV4KwfCBxPa',
    refreshTokenSecret: 'n7UU9prJefTBV6YbAPWTMZ',
    emailSecret: 'KkuFqs9jNoA3tqPJez4X3j',
  },
  logDnaKey: '',
  googleClientId:
    '1095009919728-drr0i1k90d7oodtffc8prrt7n6528n42.apps.googleusercontent.com',
  googleRecaptchaKey: 'your-key',
  googleTranslationAPIKey: 'your-api-key',
  secureCookies: false,
  corsWhitelist: ['http://localhost:3001', 'http://localhost:5000'],
};

export default devConfig;
