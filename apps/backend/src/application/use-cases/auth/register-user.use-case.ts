import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { I_USER_REPOSITORY, type IUserRepository } from '../../../domain/repositories/i-user.repository';
import { RegisterUserDto } from '../../dtos/auth/register-user.dto';
import { Role, UserEntity } from '../../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject(I_USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(dto: RegisterUserDto): Promise<Omit<UserEntity, 'passwordHash'>> {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('Email ini sudah terdaftar di sistem.');
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);

        const newUser = await this.userRepository.create({
            name: dto.name,
            email: dto.email,
            passwordHash: passwordHash,
            role: dto.role || Role.TENANT,
        });

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
}