export interface IEmailHelper {
  sendVerificationEmail(email: string, url: string): void;
}
