import IConfig from './config';

const prodConfig: IConfig = {
  dbUrl: process.env.MONGODB_URL!,
  webApplicationUrl: process.env.WEB_APP_URL!,
  emailSenderAccount: {
    service: 'Gmail',
    host: undefined,
    port: undefined,
    user: process.env.EMAIL_SENDER_USER!,
    password: process.env.EMAIL_SENDER_PASSWORD!,
  },
  secrets: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    emailSecret: process.env.EMAIL_SECRET!,
  },
  logDnaKey: process.env.LOG_DNA_KEY!,
  googleClientId:
    '1095009919728-drr0i1k90d7oodtffc8prrt7n6528n42.apps.googleusercontent.com',
  secureCookies: true,
};

export default prodConfig;