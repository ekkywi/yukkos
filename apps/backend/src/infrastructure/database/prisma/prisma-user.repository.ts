import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/i-user.repository';
import { UserEntity, Role } from '../../../domain/entities/user.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmail(email: string): Promise<UserEntity | null> {
        const model = await this.prisma.user.findUnique({ where: { email } });
        if (!model) return null;

        return new UserEntity(
            model.id,
            model.name,
            model.email,
            model.password,
            model.role as Role,
            model.createdAt,
            model.updatedAt,
        );
    }

    async create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
        const model = await this.prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.passwordHash,
                role: user.role,
            }
        });

        return new UserEntity(
            model.id,
            model.name,
            model.email,
            model.password,
            model.role as Role,
            model.createdAt,
            model.updatedAt,
        )
    }
}