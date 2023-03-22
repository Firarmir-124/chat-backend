export interface IUser {
  username: string;
  password: string;
  role: string;
  token: string;
  displayName: string;
  isOnline: boolean;
}

export interface IncomingMessage {
  type: string;
  payload: string;
}