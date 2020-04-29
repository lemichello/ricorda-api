import IConfig from './config';

const devConfig: IConfig = {
  dbUrl: 'mongodb://localhost:27017/ricorda',
  secrets: {
    jwt: 'so2i3fisi2zxh289sd',
    jwtExpires: '10 days',
  },
  logDnaKey: '',
};

export default devConfig;