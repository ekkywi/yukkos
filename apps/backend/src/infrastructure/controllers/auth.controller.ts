import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import { RegisterUserDto } from '../../application/dtos/auth/register-user.dto';
import { LoginUserDto } from '../../application/dtos/auth/login-user.dto';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Mendaftarkan pengguna baru (Penyewa / Penyedia)' })
    @ApiBody({ type: RegisterUserDto })
    @ApiResponse({ status: 201, description: 'Pengguna berhasil didaftarkan.' })
    @ApiResponse({ status: 409, description: 'Email sudah terdaftar (Conflict).' })
    async register(@Body() registerDto: RegisterUserDto) {
        const data = await this.registerUserUseCase.execute(registerDto);
        return { success: true, data };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Autentikasi pengguna untuk medapatkan JWT' })
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ status: 200, description: 'Login berhasil. Token diterbitkan.' })
    @ApiResponse({ status: 401, description: 'Kredensial tidak valid (Unauthorized).' })
    async login(@Body() loginDto: LoginUserDto) {
        const data = await this.loginUserUseCase.execute(loginDto);
        return { success: true, data }
    }
}