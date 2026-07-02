import { UserEntity } from "../entities/user.entity";

export const I_USER_REPOSITORY = 'IUserRepository';

export interface IUserRepository {
    findByEmail(email: string): Promise<UserEntity | null>;
    create(user: Omit<UserEntity, 'id' | 'createdAt' | 'udpatedAt'>): Promise<UserEntity>;
}