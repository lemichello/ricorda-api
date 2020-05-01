import IConfig from './config';

const prodConfig: IConfig = {
  dbUrl: process.env.MONGODB_URL!,
  secrets: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  },
  logDnaKey: process.env.LOG_DNA_KEY!,
  secureCookies: true,
};

export default prodConfig;
