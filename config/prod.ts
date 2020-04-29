import IConfig from './config';

const prodConfig: IConfig = {
  dbUrl: process.env.MONGODB_URL!,
  secrets: {
    jwt: process.env.JWT_SECRET!,
    jwtExpires: '10 days',
  },
  logDnaKey: process.env.LOG_DNA_KEY!,
};

export default prodConfig;
