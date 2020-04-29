export default interface IConfig {
  dbUrl: string;
  secrets: {
    jwt: string;
    jwtExpires: string;
  };
  logDnaKey: string;
}
