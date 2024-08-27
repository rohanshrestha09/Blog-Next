import { User } from 'server/models/user';
import { MultipartyFile } from 'server/utils/types';

export interface IAuthService {
  // googleLogin(): Promise<void>;
  // getProfile(): Promise<void>;
  // updateProfile(): Promise<void>;
  // deleteProfile(): Promise<void>;
  login(data: Pick<User, 'email' | 'password'>): Promise<string>;
  register(
    data: Pick<User, 'name' | 'email' | 'password' | 'dateOfBirth'>,
    file?: MultipartyFile,
  ): Promise<string>;
  completeProfile(user: User, data: Pick<User, 'password'>): Promise<void>;
  removeImage(user: User): Promise<void>;
  getProfile(user: User): Promise<User>;
  updateProfile(
    user: User,
    data: Partial<Pick<User, 'name' | 'bio' | 'website' | 'dateOfBirth'>>,
    file?: MultipartyFile,
  ): Promise<void>;
}