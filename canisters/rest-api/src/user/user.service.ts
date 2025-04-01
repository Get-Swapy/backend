import { Injectable } from '@nestjs/common';
import { StableBTreeMap } from 'azle';
import { text } from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';

import { User } from './entities/user.entity';
import { UserNotFoundError } from './user.errors';

const users = new StableBTreeMap<text, User>(0);

type CreateUserData = {
  externalId: string;
};

type CreateUserResult = {
  id: string;
  externalId: string;
};

@Injectable()
export class UserService {
  public getAll(): User[] {
    return users.values();
  }

  public create(data: CreateUserData): CreateUserResult {
    const userId = uuidv4();

    const maybeUser =
      users.values().find((user) => user.externalId === data.externalId) ||
      users.get(userId);

    if (maybeUser) throw new Error('User already exists');

    const newUser = {
      id: userId,
      externalId: data.externalId,
    };

    users.insert(newUser.id, newUser);

    return newUser;
  }

  public removeById(userId: string) {
    return users.remove(userId);
  }

  public getById(userId: string): User {
    const maybeUser = users.get(userId);

    if (!maybeUser) {
      throw new UserNotFoundError(userId);
    }

    return maybeUser;
  }

  public getByExternalId(externalId: string): User {
    const maybeUser = users
      .values()
      .find((user) => user.externalId === externalId);

    if (!maybeUser) {
      throw new UserNotFoundError(`with external ID ${externalId}`);
    }

    return maybeUser;
  }
}
