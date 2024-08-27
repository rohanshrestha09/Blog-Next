import { User } from 'server/models/user';
import { IUserService } from 'server/ports/user';
import { UserRepository } from 'server/repositories/user';
import { FilterProps } from 'server/utils/types';

export class UserService implements IUserService {
  private readonly userRepository = new UserRepository();

  async getFollowers(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[User[], number]> {
    return await this.userRepository
      .findAllUsers({})
      .followedBy(userId, filter.search)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .executeWithSession(sessionId);
  }

  async getFollowing(
    userId: string,
    filter: FilterProps,
    sessionId?: string,
  ): Promise<[User[], number]> {
    return await this.userRepository
      .findAllUsers({})
      .following(userId, filter.search)
      .withPagination(filter.page, filter.size)
      .withSort(filter.sort, filter.order)
      .executeWithSession(sessionId);
  }
}