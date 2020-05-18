export default interface IConfig {
  dbUrl: string;
  webApplicationUrl: string;
  emailSenderAccount: {
    service: string | undefined;
    host: string | undefined;
    user: string;
    password: string;
    port: number | undefined;
  };
  secrets: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    emailSecret: string;
  };
  logDnaKey: string;
  googleClientId: string;
  secureCookies: boolean;
}
