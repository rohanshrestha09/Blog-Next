import { Document, Types } from 'mongoose';
import { IUserSchema } from './schema';
import IMessage from './message';

type RegisterKeys = Record<string, string | boolean>;

export interface IToken extends IMessage {
  token: string;
}

export interface IRegister extends RegisterKeys {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  remember: boolean;
}

export interface ILogin {
  email: string;
  password: string;
  remember: boolean;
}

export type IUserData = Omit<
  Document<unknown, any, IUserSchema> & IUserSchema & { _id: Types.ObjectId & string },
  never
>;

export interface IUserReq extends IMessage {
  user: IUserData;
}

export interface IUser extends IMessage {
  data: IUserData;
}

export interface IAuthReq extends IMessage {
  auth: IUserData;
}

export interface IAuth extends IMessage {
  data: IUserData;
}

export interface IUsers extends IMessage {
  data: IUserData[];
  count: number;
}
