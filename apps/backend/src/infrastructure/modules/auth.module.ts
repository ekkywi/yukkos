import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import { PrismaUserRepository } from '../database/prisma/prisma-user.repository';
import { JwtTokenService } from '../security/jwt/jwt-token.service';
import { I_USER_REPOSITORY } from '../../domain/repositories/i-user.repository';
import { I_TOKEN_SERVICE } from '../../application/ports/i-token.service';
import { PrismaService } from '../database/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key_yukkos_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService, 
    
    RegisterUserUseCase,
    LoginUserUseCase,
    {
      provide: I_USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: I_TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
})
export class AuthModule {}