import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { I_USER_REPOSITORY, type IUserRepository } from '../../../domain/repositories/i-user.repository';
import { I_TOKEN_SERVICE, type ITokenService } from '../../ports/i-token.service';
import { LoginUserDto } from '../../dtos/auth/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUserUseCase {
    constructor(
        @Inject(I_USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(I_TOKEN_SERVICE) private readonly tokenService: ITokenService
    ) {}

    async execute(dto: LoginUserDto): Promise<{ access_token: string; role: string }> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        const token = this.tokenService.generateToken({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            access_token: token,
            role: user.role,
        }
    }

}