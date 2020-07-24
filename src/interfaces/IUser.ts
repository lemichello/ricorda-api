export interface IUser {
  _id: string;
  email: string;
  password: string | null;
  isVerified: boolean;
  tokenVersion: number;
  externalType: 'Google' | null;
  externalId: string | null;
  translationLanguage: string;
}
