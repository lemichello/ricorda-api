export interface ILoggingHelper {
  info(message: string, metaData?: object): void;
  error(message: string, metaData?: object): void;
  debug(message: string, metaData?: object): void;
}
