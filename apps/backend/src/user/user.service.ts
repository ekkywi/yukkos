import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../infrastructure/database/prisma.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async register(data: RegisterUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('Email ini sudah terdaftar di sistem.');
        }

        const saltRound = 10;
        const hashedpassword = await bcrypt.hash(data.password, saltRound);

        const newUser = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedpassword,
                role: data.role || 'TENANT',
            },
        });

        const { password, ...result } = newUser;
        return result;
    }
}