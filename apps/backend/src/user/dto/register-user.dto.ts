import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterUserDto {
  @ApiProperty({ 
    example: 'John Doe', 
    description: 'Nama lengkap pengguna' 
  })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  name!: string;

  @ApiProperty({ 
    example: 'john@example.com', 
    description: 'Alamat email aktif yang belum terdaftar' 
  })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Kata sandi untuk login', 
    minLength: 6 
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @ApiPropertyOptional({ 
    enum: Role, 
    example: Role.TENANT, 
    description: 'Peran pengguna. Jika dikosongkan, default adalah TENANT (Penyewa).' 
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role tidak valid' })
  role?: Role;
}