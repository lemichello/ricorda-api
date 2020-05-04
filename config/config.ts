export default interface IConfig {
  dbUrl: string;
  secrets: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
  };
  logDnaKey: string;
  googleClientId: string;
  secureCookies: boolean;
}
