import IConfig from './config';

const prodConfig: IConfig = {
  dbUrl: process.env.MONGODB_URL!,
  webApplicationUrl: process.env.WEB_APP_URL!,
  apiRootUrl: process.env.API_ROOT_URL!,
  projectId: process.env.PROJECT_ID!,
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
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleTranslationAPIKey: process.env.GOOGLE_TRANSLATION_API_KEY!,
  secureCookies: true,
  corsWhitelist: [process.env.WEB_APP_URL!],
};

export default prodConfig;
