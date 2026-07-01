import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Mendaftarkan pengguna baru (Penyewa / Penyedia)' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'Pengguna berhasil didaftarkan.' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar (Conflict).' })
  @ApiResponse({ status: 400, description: 'Validasi input gagal (Bad Request).' })
  async register(
    @Body(new ValidationPipe({ whitelist: true })) registerDto: RegisterUserDto,
  ) {
    const data = await this.userService.register(registerDto);
    return { success: true, data };
  }
}