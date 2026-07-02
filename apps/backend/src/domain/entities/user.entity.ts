export enum Role {
    TENANT = 'TENANT',
    PROVIDER = 'PROVIDER',
    ADMIN = 'ADMIN',
}

export class UserEntity {
    constructor(
        public readonly id: string,
        public name: string,
        public email: string,
        public passwordHash: string,
        public role: Role,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
    ) {}
}